import type { NormalizedQuestion } from '../types/question';

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeOptions(input: any): string[] {
  if (Array.isArray(input)) return input.map((o) => String(o).trim()).filter(Boolean);
  return [];
}

export function normalizeQuestion(raw: any): NormalizedQuestion {
  const options = normalizeOptions(raw.options ?? raw.choices ?? raw.answers);
  const correct = asString(raw.correctAnswer ?? raw.answer ?? raw.correct_answer) ?? '';
  return {
    id: asString(raw.id) ?? '',
    domain: asString(raw.domain) ?? 'General',
    subdomain: asString(raw.subdomain),
    difficulty: asString(raw.difficulty)?.toLowerCase() ?? 'medium',
    question: asString(raw.question ?? raw.prompt) ?? '',
    options,
    correctAnswer: correct,
    explanation: asString(raw.explanation),
    source: asString(raw.source),
    citation: asString(raw.citation),
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: unknown) => String(t)) : undefined,
  };
}
