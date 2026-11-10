import { describe, expect, it } from 'vitest';
import { SCHEDULE_DAYS } from '../scheduledExam';
import { FULL_EXAM_PLAN, FULL_EXAM_PRODUCTION_HOST, FULL_EXAM_SCHEDULE, fullExamSlots, isFullExamTestMode } from '../fullExamPlan';

describe('full exam line plan', () => {
  it('keeps the combined exam at 100 general and 50 state questions', () => {
    for (const state of ['TX', 'FL'] as const) {
      expect(FULL_EXAM_PLAN[state].both).toMatchObject({ questions: 150, minutes: 150, generalCount: 100, stateCount: 50 });
    }
  });

  it('uses handbook lengths where the bank can supply them, and one minute per question otherwise', () => {
    expect(FULL_EXAM_PLAN.TX.life).toMatchObject({ questions: 80, minutes: 120, generalCount: 50, stateCount: 30 });
    expect(FULL_EXAM_PLAN.FL.life).toMatchObject({ questions: 85, minutes: 120, generalCount: 50, stateCount: 35 });
    expect(FULL_EXAM_PLAN.TX.health).toMatchObject({ questions: 93, minutes: 93, generalCount: 49, stateCount: 44 });
    expect(FULL_EXAM_PLAN.FL.health).toMatchObject({ questions: 84, minutes: 84, generalCount: 49, stateCount: 35 });
  });

  it('offers every hour Monday through Sunday and leaves the scheduled exam dates alone', () => {
    expect(FULL_EXAM_SCHEDULE.days).toEqual(['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15']);
    expect(SCHEDULE_DAYS).toEqual(['2026-10-24', '2026-10-25']);
    expect(fullExamSlots).toHaveLength(168);
    const format = (time: number) => new Intl.DateTimeFormat('en-US', { timeZone: FULL_EXAM_SCHEDULE.timeZone, weekday: 'long', hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).format(time);
    expect(format(fullExamSlots[0].startsAt)).toContain('Monday');
    expect(format(fullExamSlots[0].startsAt)).toContain('00:00');
    expect(format(fullExamSlots.at(-1)!.startsAt)).toContain('Sunday');
    expect(format(fullExamSlots.at(-1)!.startsAt)).toContain('23:00');
    expect(fullExamSlots[0].endsAt - fullExamSlots[0].startsAt).toBe(60 * 60_000);
  });

  it('offers test mode only away from the production hostname', () => {
    expect(isFullExamTestMode(FULL_EXAM_PRODUCTION_HOST, '?prueba=1')).toBe(false);
    expect(isFullExamTestMode('localhost')).toBe(true);
    expect(isFullExamTestMode('alleanzasimulator-2ppc-git-cur.vercel.app')).toBe(true);
  });

  it('adds the section sizes to the published question count', () => {
    for (const state of ['TX', 'FL'] as const) {
      for (const line of ['both', 'life', 'health'] as const) {
        const plan = FULL_EXAM_PLAN[state][line];
        expect(plan.generalCount + plan.stateCount).toBe(plan.questions);
      }
    }
  });
});
