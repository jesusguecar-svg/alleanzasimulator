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
