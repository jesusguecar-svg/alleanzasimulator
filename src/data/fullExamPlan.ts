import type { ExamLines } from './scheduledExam';

export type FullExamState = 'TX' | 'FL';

export type FullExamLinePlan = {
  questions: number;
  minutes: number;
  generalCount: number;
  stateCount: number;
  /** Null keeps every general question (Modules 1–9). */
  generalModules: string[] | null;
  /** Null keeps every state-law question for the selected state. */
  stateModules: string[] | null;
};

/**
 * Scored-question targets from the Pearson VUE candidate handbooks.
 * Pretest items are not in this bank, so they are not added.
 *
 * Texas Life Agent (InsTX-Life01): 50 general + 30 state, 120 minutes.
 *   Handbook 124400; content outline 124401, effective September 1, 2026.
 * Texas has no Health-only exam in that handbook. Health uses every
 *   M5–M9 question and every common + health/HMO state question, one minute each.
 * Florida 2-14 Life (InsFL-Life01): 85 scored questions, 2 hours.
 *   Handbook 121000; outline 121003, effective January 1, 2026 (about 50 general + 35 state).
 * Florida 2-40 Health (InsFL-Health02): 85 scored questions, 2 hours.
 *   The health general pool has 49 questions, so the exam is 49 + 35 = 84 at one minute each.
 * Vida y Salud stays the existing 100 general + 50 state, 150 minutes.
 */
export const FULL_EXAM_PLAN: Record<FullExamState, Record<ExamLines, FullExamLinePlan>> = {
  TX: {
    both: { questions: 150, minutes: 150, generalCount: 100, stateCount: 50, generalModules: null, stateModules: null },
    life: { questions: 80, minutes: 120, generalCount: 50, stateCount: 30, generalModules: ['M1', 'M2', 'M3', 'M4'], stateModules: ['TC', 'TL'] },
    health: { questions: 93, minutes: 93, generalCount: 49, stateCount: 44, generalModules: ['M5', 'M6', 'M7', 'M8', 'M9'], stateModules: ['TC', 'TH', 'TM'] },
  },
  FL: {
    both: { questions: 150, minutes: 150, generalCount: 100, stateCount: 50, generalModules: null, stateModules: null },
    life: { questions: 85, minutes: 120, generalCount: 50, stateCount: 35, generalModules: ['M1', 'M2', 'M3', 'M4'], stateModules: ['FLC', 'FLL'] },
    health: { questions: 84, minutes: 84, generalCount: 49, stateCount: 35, generalModules: ['M5', 'M6', 'M7', 'M8', 'M9'], stateModules: ['FLC', 'FLH'] },
  },
};

export const FULL_EXAM_REGISTRATION_KEY = 'alleanza-full-exam-registration';
export const FULL_EXAM_PLAYER_PATH = '/examen-completo/sesion';
