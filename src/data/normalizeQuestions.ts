import type { NormalizedQuestion } from '../types/question';
import { normalizeDomainName } from './domainCatalog';

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeOptions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((o) => {
      if (typeof o === 'string') return o.trim();
      if (o && typeof o === 'object') {
        const text = asString((o as { text?: unknown }).text);
        if (text) return text;
      }
      return String(o).trim();
    })
    .filter(Boolean);
}

function resolveCorrectAnswer(raw: any, options: string[]): string {
  const direct = asString(raw.correctAnswer ?? raw.answer ?? raw.correct_answer);
  if (!direct) return '';

  if (options.includes(direct)) return direct;

  if (Array.isArray(raw.options) && raw.options.length) {
    const matchedByLabel = raw.options.find((o: unknown) => {
      if (!o || typeof o !== 'object') return false;
      return asString((o as { label?: unknown }).label)?.toLowerCase() === direct.toLowerCase();
    }) as { text?: unknown } | undefined;

    const labelText = asString(matchedByLabel?.text);
    if (labelText) return labelText;
  }

  return direct;
}

function buildOptionExplanations(raw: any): Record<string, string> | undefined {
  const wrong = raw.wrong_explanations;
  if (!wrong || typeof wrong !== 'object' || !Array.isArray(raw.options)) return undefined;

  const explanations: Record<string, string> = {};

  for (const option of raw.options as Array<{ label?: unknown; text?: unknown }>) {
    const text = asString(option?.text);
    const label = asString(option?.label);
    if (!text || !label) continue;

    const explanation = asString((wrong as Record<string, unknown>)[label]);
    if (explanation) explanations[text] = explanation;
  }

  return Object.keys(explanations).length ? explanations : undefined;
}

export function normalizeQuestion(raw: any): NormalizedQuestion {
  const options = normalizeOptions(raw.options ?? raw.choices ?? raw.answers);
  const correct = resolveCorrectAnswer(raw, options);

  return {
    id: asString(raw.id ?? raw.question_id) ?? '',
    domain: normalizeDomainName(asString(raw.domain)),
    subdomain: asString(raw.subdomain),
    difficulty: asString(raw.difficulty)?.toLowerCase() ?? 'medium',
    question: asString(raw.question ?? raw.prompt ?? raw.stem) ?? '',
    options,
    correctAnswer: correct,
    explanation: asString(raw.explanation ?? raw.correct_explanation),
    optionExplanations: buildOptionExplanations(raw),
    source: asString(raw.source),
    citation: asString(raw.citation),
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: unknown) => String(t)) : undefined,
  };
}
