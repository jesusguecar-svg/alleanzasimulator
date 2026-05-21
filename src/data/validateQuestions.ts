import type { NormalizedQuestion } from '../types/question';

export type ValidationResult = {
  valid: NormalizedQuestion[];
  invalid: { id?: string; reason: string }[];
  duplicates: string[];
};

export function validateQuestions(questions: NormalizedQuestion[]): ValidationResult {
  const valid: NormalizedQuestion[] = [];
  const invalid: { id?: string; reason: string }[] = [];
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const q of questions) {
    if (!q.id) { invalid.push({ reason: 'Falta id' }); continue; }
    if (seen.has(q.id)) { duplicates.add(q.id); invalid.push({ id: q.id, reason: 'ID duplicado' }); continue; }
    seen.add(q.id);
    if (!q.question) { invalid.push({ id: q.id, reason: 'Falta texto de pregunta' }); continue; }
    if (!q.options || q.options.length < 2) { invalid.push({ id: q.id, reason: 'Menos de 2 opciones' }); continue; }
    if (!q.correctAnswer) { invalid.push({ id: q.id, reason: 'Falta respuesta correcta' }); continue; }
    const normalized = q.options.map((o) => o.trim().toLowerCase());
    if (!normalized.includes(q.correctAnswer.trim().toLowerCase())) { invalid.push({ id: q.id, reason: 'Respuesta correcta no coincide con opciones' }); continue; }
    valid.push(q);
  }

  return { valid, invalid, duplicates: [...duplicates] };
}
