import { normalizeQuestion } from './normalizeQuestions';
import { validateQuestions } from './validateQuestions';
import type { NormalizedQuestion } from '../types/question';

// Solo se permiten preguntas desde la carpeta oficial validada.
const modules = import.meta.glob('/validated_questions/*.json', { eager: true });

function extractEntries(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.questions)) return obj.questions;
    return [obj];
  }
  return [];
}

export function loadQuestions(): {
  questions: NormalizedQuestion[];
  invalidCount: number;
  filesLoaded: number;
} {
  const rawQuestions: unknown[] = [];
  const entries = Object.values(modules);

  for (const mod of entries) {
    const data = (mod as { default: unknown }).default;
    rawQuestions.push(...extractEntries(data));
  }

  const normalized = rawQuestions.map(normalizeQuestion);
  const { valid, invalid } = validateQuestions(normalized);

  if (import.meta.env.DEV && invalid.length) {
    console.warn('Preguntas inválidas detectadas y excluidas:', invalid);
  }

  return {
    questions: valid,
    invalidCount: invalid.length,
    filesLoaded: entries.length,
  };
}
