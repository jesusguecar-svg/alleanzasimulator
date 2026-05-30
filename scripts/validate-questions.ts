import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { normalizeQuestion } from '../src/data/normalizeQuestions';
import { validateQuestions } from '../src/data/validateQuestions';

function extractRawQuestions(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const maybeQuestions = (data as { questions?: unknown }).questions;
    if (Array.isArray(maybeQuestions)) return maybeQuestions;
  }
  return [];
}

const dir = join(process.cwd(), 'validated_questions');
const files = (await readdir(dir).catch(() => [])).filter((file) => file.endsWith('.json'));
const raw: unknown[] = [];

for (const file of files) {
  const content = JSON.parse(await readFile(join(dir, file), 'utf8'));
  raw.push(...extractRawQuestions(content));
}

const { valid, invalid, duplicates } = validateQuestions(raw.map(normalizeQuestion));
console.log(`Archivos: ${files.length}`);
console.log(`Preguntas válidas: ${valid.length}`);
console.log(`Preguntas inválidas: ${invalid.length}`);
console.log(`IDs duplicados: ${duplicates.length}`);
if (valid.length === 0) process.exit(1);
