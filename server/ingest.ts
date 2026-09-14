import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import readline from 'node:readline';
import crypto from 'node:crypto';
import XLSX from 'xlsx';

type UploadedFile = { path: string; originalname: string; mimetype: string; size: number };
type Workspace = { id: string };

function normalize(value: unknown) { return String(value ?? '').trim(); }
function inferType(values: string[]) {
  const sample = values.filter(Boolean).slice(0, 100);
  if (sample.length && sample.every(v => !Number.isNaN(Number(v)))) return 'number';
  if (sample.length && sample.every(v => !Number.isNaN(Date.parse(v)))) return 'date';
  return 'string';
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
    row.push(cell); if (row.some(v => v.trim())) rows.push(row);
    if (rows.length >= 10001) break;
  }
  return rows;
}

export async function ingestFile(workspace: Workspace, file: UploadedFile, id: string) {
  let rows: unknown[][] = [];
  if (/\.csv$/i.test(file.originalname)) rows = await readCsv(file.path);
  else {
    const workbook = XLSX.readFile(file.path, { cellDates: true, sheetRows: 10001 });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
  }
  await unlink(file.path).catch(() => undefined);
  const header = (rows.shift() || []).map(normalize).map((v, i) => v || `column_${i + 1}`);
  const sample = rows.slice(0, 10000);
  const columns = header.map((name, index) => ({ name, type: inferType(sample.map(r => normalize(r[index]))), nullable: sample.some(r => !normalize(r[index])) }));
  const dataQualityScore = Math.round((header.length ? (columns.filter(c => !c.nullable).length / header.length) * 40 : 0) + (rows.length ? 40 : 0) + (rows.length <= 10000 ? 20 : 10));
  const hash = crypto.createHash('sha256').update(JSON.stringify({ header, rows: sample })).digest('hex');
  return {
    id, workspaceId: workspace.id, name: file.originalname, status: 'ready', rowCount: rows.length,
    schema: { columns }, preview: sample.slice(0, 25), dataQualityScore: Math.min(100, dataQualityScore),
    source: { type: /\.csv$/i.test(file.originalname) ? 'CSV' : 'XLSX', size: file.size, hash },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}
