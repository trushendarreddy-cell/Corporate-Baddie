import { appendFile, mkdir, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import * as XLSX from 'xlsx';

type UploadedFile = { path: string; originalname: string; mimetype: string; size: number };
type Workspace = { id: string };

const DATA_DIR = path.resolve(process.env.DATA_DIR || './server/data');
const TABLE_DIR = path.join(DATA_DIR, 'tables');

function normalize(value: unknown) { return String(value ?? '').trim(); }
function inferType(values: string[]) {
  const sample = values.filter(Boolean).slice(0, 100);
  if (sample.length && sample.every(v => v !== '' && !Number.isNaN(Number(v)))) return 'number';
  if (sample.length && sample.every(v => !Number.isNaN(Date.parse(v)))) return 'date';
  return 'string';
}
function toRecord(header: string[], row: unknown[]) {
  return Object.fromEntries(header.map((name, index) => [name, row[index] ?? '']));
}

/**
 * Split CSV text into rows of cells.
 *
 * This walks the whole string rather than splitting on newlines, because a
 * quoted field may legally contain a newline. The previous readline-based
 * version broke such a row in two and lost the tail of the cell.
 * Exported for the ingest test suite.
 */
export function parseCsvForTest(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else {
        cell += c;
      }
      continue;
    }

    if (c === '"') { quoted = true; continue; }
    if (c === ',') { row.push(cell); cell = ''; continue; }
    if (c === '\r') continue;
    if (c === '\n') { row.push(cell); cell = ''; if (row.some(v => v.trim())) rows.push(row); row = []; continue; }
    cell += c;
  }

  // Flush the final cell and row when the file has no trailing newline.
  if (cell.length || row.length) {
    row.push(cell);
    if (row.some(v => v.trim())) rows.push(row);
  }

  return rows;
}

async function readCsv(filePath: string) {
  return parseCsvForTest(await readFile(filePath, 'utf8'));
}

/** Exposed for the ingest test suite. */
export const inferTypeForTest = inferType;

export async function ingestFile(workspace: Workspace, file: UploadedFile, id: string) {
  let rows: unknown[][] = [];
  if (/\.csv$/i.test(file.originalname)) {
    rows = await readCsv(file.path);
  } else {
    const workbook = XLSX.readFile(file.path, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error('The uploaded workbook has no readable sheets.');
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
  }

  await mkdir(TABLE_DIR, { recursive: true });
  const header = (rows.shift() || []).map(normalize).map((v, i) => v || `column_${i + 1}`);
  if (!header.length) throw new Error('The uploaded file has no header row.');

  const seen = new Set<string>();
  const normalizedHeader = header.map((name, index) => {
    if (!seen.has(name)) { seen.add(name); return name; }
    const unique = `${name}_${index + 1}`;
    seen.add(unique);
    return unique;
  });

  const records = rows.filter(row => row.some(value => normalize(value))).map(row => toRecord(normalizedHeader, row));
  const sample = records.slice(0, 100);
  const columns = normalizedHeader.map((name) => {
    const values = records.map(record => normalize(record[name]));
    return { name, type: inferType(values), nullable: values.some(value => !value), nullCount: values.filter(value => !value).length, sampleValues: values.filter(Boolean).slice(0, 5) };
  });
  const totalCells = Math.max(1, records.length * normalizedHeader.length);
  const nullCells = columns.reduce((sum, column) => sum + column.nullCount, 0);
  const completeness = Math.round(((totalCells - nullCells) / totalCells) * 100);
  const hash = crypto.createHash('sha256').update(JSON.stringify({ header: normalizedHeader, records })).digest('hex');
  const storagePath = path.join(TABLE_DIR, `${id}.jsonl`);

  await unlink(storagePath).catch(() => undefined);
  for (const record of records) await appendFile(storagePath, `${JSON.stringify(record)}\n`, 'utf8');
  await unlink(file.path).catch(() => undefined);

  return {
    id, workspaceId: workspace.id, name: file.originalname, status: 'ready', rowCount: records.length,
    schema: { columns }, preview: sample.slice(0, 25), dataQualityScore: Math.max(0, Math.min(100, completeness)),
    contentHash: `sha256:${hash}`,
    source: { type: /\.csv$/i.test(file.originalname) ? 'CSV' : 'Excel', size: file.size, hash: `sha256:${hash}` },
    storagePath, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}
