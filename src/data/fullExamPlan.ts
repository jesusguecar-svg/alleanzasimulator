import type { ExamLines, ExamSlot } from './scheduledExam';

/** Full-exam weekend. Change this object to move the dates. Hours are Central Time. */
export const FULL_EXAM_SCHEDULE = {
  days: ['2026-11-14', '2026-11-15'],
  firstHour: 8,
  lastHour: 20,
  startWindowMinutes: 60,
  timeZone: 'America/Chicago',
  // Nov 14–15 2026 are after the DST change on Nov 1, so Central is CST (UTC−6).
  utcOffset: '-06:00',
} as const;

export const FULL_EXAM_TEST_SLOT = 'PRUEBA';
export const FULL_EXAM_PRODUCTION_HOST = 'alleanzasimulator-texas.vercel.app';

export const fullExamSlots: ExamSlot[] = FULL_EXAM_SCHEDULE.days.flatMap((day) => {
  const slots: ExamSlot[] = [];
  for (let hour = FULL_EXAM_SCHEDULE.firstHour; hour <= FULL_EXAM_SCHEDULE.lastHour; hour += 1) {
    const startsAt = Date.parse(`${day}T${String(hour).padStart(2, '0')}:00:00${FULL_EXAM_SCHEDULE.utcOffset}`);
    slots.push({ id: `${day}T${String(hour).padStart(2, '0')}`, startsAt, endsAt: startsAt + FULL_EXAM_SCHEDULE.startWindowMinutes * 60_000 });
  }
  return slots;
});

export const getFullExamSlot = (slotId: string) => fullExamSlots.find((slot) => slot.id === slotId);

/** Preview and local builds can skip the slot lock. The production hostname never can. */
export function isFullExamTestMode(hostname: string, search = ''): boolean {
  if (hostname === FULL_EXAM_PRODUCTION_HOST) return false;
  const nonProduction = import.meta.env.VITE_VERCEL_ENV !== 'production';
  const prueba = new URLSearchParams(search).get('prueba') === '1';
  return nonProduction || hostname !== FULL_EXAM_PRODUCTION_HOST || prueba;
}

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
