import { describe, expect, it } from 'vitest';
import { FULL_EXAM_PLAN } from '../fullExamPlan';

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

  it('adds the section sizes to the published question count', () => {
    for (const state of ['TX', 'FL'] as const) {
      for (const line of ['both', 'life', 'health'] as const) {
        const plan = FULL_EXAM_PLAN[state][line];
        expect(plan.generalCount + plan.stateCount).toBe(plan.questions);
      }
    }
  });
});
