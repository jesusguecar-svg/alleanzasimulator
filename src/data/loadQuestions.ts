import { normalizeQuestion } from './normalizeQuestions';
import { validateQuestions } from './validateQuestions';
import type { NormalizedQuestion } from '../types/question';
import floridaQuestionBank from '../../validated_questions/question_bank_validated_florida_150_es.json';

const modules = import.meta.glob('/validated_questions/*.json', { eager: true });

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

/**
 * The scheduled Florida exam deliberately uses one bank instead of the legacy
 * glob above. Keeping this import explicit prevents a newly-added batch (for
 * example B10 or another state's bank) from silently entering a live exam.
 */
export function loadScheduledExamQuestions(): { questions: NormalizedQuestion[]; invalidCount: number } {
  const normalized = extractRawQuestions(floridaQuestionBank).map(normalizeQuestion);
  const { valid, invalid } = validateQuestions(normalized);

  if (import.meta.env.DEV && invalid.length) {
    console.warn('Preguntas inválidas en el banco del examen programado', invalid);
  }

  return { questions: valid, invalidCount: invalid.length };
}
