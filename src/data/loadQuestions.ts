import { normalizeQuestion } from './normalizeQuestions';
import { validateQuestions } from './validateQuestions';
import type { NormalizedQuestion } from '../types/question';

const modules = import.meta.glob('/validated_questions/*.json', { eager: true });
const scheduledExamBatches = import.meta.glob(
  '/validated_questions/question_bank_validated_batch_*_es.json',
  { eager: true },
);

function extractRawQuestions(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const maybeQuestions = (data as { questions?: unknown }).questions;
    if (Array.isArray(maybeQuestions)) return maybeQuestions;
  }
  return [];
}

export function loadQuestions(): { questions: NormalizedQuestion[]; invalidCount: number } {
  const rawQuestions: unknown[] = [];

  for (const mod of Object.values(modules)) {
    const data = (mod as { default: unknown }).default;
    rawQuestions.push(...extractRawQuestions(data));
  }

  const normalized = rawQuestions.map(normalizeQuestion);
  const { valid, invalid } = validateQuestions(normalized);

  if (import.meta.env.DEV && invalid.length) {
    console.warn('Preguntas inválidas detectadas', invalid);
  }

  return { questions: valid, invalidCount: invalid.length };
}

/** Loads only the validated general-course batches for modules 1–9. */
export function loadScheduledExamQuestions(): { questions: NormalizedQuestion[]; invalidCount: number } {
  const rawQuestions = Object.entries(scheduledExamBatches).flatMap(([file, mod]) => {
    const batch = /question_bank_validated_batch_(\d+)_es\.json$/.exec(file);
    if (!batch || Number(batch[1]) < 1 || Number(batch[1]) > 9) return [];
    return extractRawQuestions((mod as { default: unknown }).default);
  });
  const normalized = rawQuestions.map(normalizeQuestion);
  const { valid, invalid } = validateQuestions(normalized);

  if (import.meta.env.DEV && invalid.length) {
    console.warn('Preguntas inválidas en los lotes del examen programado', invalid);
  }

  return { questions: valid, invalidCount: invalid.length };
}
