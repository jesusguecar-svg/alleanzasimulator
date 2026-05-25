import { normalizeQuestion } from './normalizeQuestions';
import { validateQuestions } from './validateQuestions';
import type { NormalizedQuestion } from '../types/question';

const modules = import.meta.glob('../../validated_questions/*.json', { eager: true });

export function loadQuestions(): { questions: NormalizedQuestion[]; invalidCount: number } {
  const rawQuestions: unknown[] = [];
  for (const mod of Object.values(modules)) {
    const data = (mod as { default: unknown }).default;
    if (Array.isArray(data)) rawQuestions.push(...data);
    else if (data && typeof data === 'object') rawQuestions.push(data);
  }
  const normalized = rawQuestions.map(normalizeQuestion);
  const { valid, invalid } = validateQuestions(normalized);
  if (import.meta.env.DEV && invalid.length) {
    console.warn('Preguntas inválidas detectadas', invalid);
  }
  return { questions: valid, invalidCount: invalid.length };
}
