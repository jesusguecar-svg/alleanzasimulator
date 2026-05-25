import type { NormalizedQuestion } from '../types/question';

const KEY = 'tx-general-lines-progress';

export type ProgressData = {
  answeredIds: string[];
  correctIds: string[];
  incorrectIds: string[];
  attempts: Record<string, number>;
  lastSessionScore?: number;
};

const initial: ProgressData = { answeredIds: [], correctIds: [], incorrectIds: [], attempts: {} };

export function getProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

export function saveProgress(progress: ProgressData): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function clearProgress(): void {
  localStorage.removeItem(KEY);
}


export function getDashboardStats(allQuestions: NormalizedQuestion[]) {
  const p = getProgress();
  const byDomain: Record<string, { total: number; correct: number; attempts: number }> = {};

  for (const q of allQuestions) {
    if (!p.answeredIds.includes(q.id)) continue;
    const d = byDomain[q.domain] ?? { total: 0, correct: 0, attempts: 0 };
    d.total += 1;
    if (p.correctIds.includes(q.id)) d.correct += 1;
    d.attempts += p.attempts[q.id] ?? 0;
    byDomain[q.domain] = d;
  }

  return {
    byDomain,
    totalAnswered: p.answeredIds.length,
    totalCorrect: p.correctIds.length,
    overallPercent: p.answeredIds.length
      ? Math.round((p.correctIds.length / p.answeredIds.length) * 100)
      : 0,
  };
}
