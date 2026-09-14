import { createReadStream } from 'node:fs';
import { appendFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import crypto from 'node:crypto';
import XLSX from 'xlsx';

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

async function readCsv(filePath: string) {
  const rows: string[][] = [];
  const rl = readline.createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  for await (const line of rl) {
    const row: string[] = []; let cell = ''; let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (quoted && line[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
      else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
      else cell += c;
    }
    row.push(cell);
    if (row.some(v => v.trim())) rows.push(row);
  }
  return rows;
}

export async function ingestFile(workspace: Workspace, file: UploadedFile, id: string) {
  let rows: unknown[][] = [];
  if (/\.csv$/i.test(file.originalname)) {
    rows = await readCsv(file.path);
  } else {
    const workbook = XLSX.readFile(file.path, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
  }

  await mkdir(TABLE_DIR, { recursive: true });
  const header = (rows.shift() || []).map(normalize).map((v, i) => v || `column_${i + 1}`);
  if (!header.length) throw new Error('The uploaded file has no header row.');

  const records = rows.filter(row => row.some(value => normalize(value))).map(row => toRecord(header, row));
  const sample = records.slice(0, 100);
  const columns = header.map((name, index) => {
    const values = records.map(record => normalize(record[name]));
    return {
      name,
      type: inferType(values),
      nullable: values.some(value => !value),
      nullCount: values.filter(value => !value).length,
      sampleValues: values.filter(Boolean).slice(0, 5),
    };
  });

  const totalCells = Math.max(1, records.length * header.length);
  const nullCells = columns.reduce((sum, column) => sum + column.nullCount, 0);
  const completeness = Math.round(((totalCells - nullCells) / totalCells) * 100);
  const dataQualityScore = Math.max(0, Math.min(100, completeness));
  const hash = crypto.createHash('sha256').update(JSON.stringify({ header, records })).digest('hex');
  const storagePath = path.join(TABLE_DIR, `${id}.jsonl`);

  await unlink(storagePath).catch(() => undefined);
  for (const record of records) await appendFile(storagePath, `${JSON.stringify(record)}\n`, 'utf8');
  await unlink(file.path).catch(() => undefined);

  return {
    id,
    workspaceId: workspace.id,
    name: file.originalname,
    status: 'ready',
    rowCount: records.length,
    schema: { columns },
    preview: sample.slice(0, 25),
    dataQualityScore,
    contentHash: `sha256:${hash}`,
    source: { type: /\.csv$/i.test(file.originalname) ? 'CSV' : 'XLSX', size: file.size, hash: `sha256:${hash}` },
    storagePath,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
