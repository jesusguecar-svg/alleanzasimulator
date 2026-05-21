import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { normalizeQuestion } from '../src/data/normalizeQuestions';
import { validateQuestions } from '../src/data/validateQuestions';

const dir = join(process.cwd(), 'validated_questions');
const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.json'));

const raw: unknown[] = [];
for (const f of files) {
  const content = JSON.parse(await readFile(join(dir, f), 'utf8'));
  if (Array.isArray(content)) raw.push(...content);
  else if (content && typeof content === 'object' && Array.isArray((content as Record<string, unknown>).questions)) {
    raw.push(...((content as Record<string, unknown>).questions as unknown[]));
  } else {
    raw.push(content);
  }
}

const { valid, invalid, duplicates } = validateQuestions(raw.map(normalizeQuestion));
console.log(`Archivos: ${files.length}`);
console.log(`Preguntas válidas: ${valid.length}`);
console.log(`Preguntas inválidas: ${invalid.length}`);
console.log(`IDs duplicados: ${duplicates.length}`);
if (valid.length === 0) {
  console.error('Error: no hay preguntas válidas en validated_questions/.');
  process.exit(1);
}
