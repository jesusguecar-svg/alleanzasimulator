import { describe, expect, it } from 'vitest';
import { loadScheduledExamQuestions } from '../loadQuestions';
import type { SessionQuestion } from '../../types/question';
import {
  buildExamReport,
  buildScheduledExamSession,
  examSlots,
  formatSlotLabel,
  getScheduledExamCategory,
  getSlotState,
  hasTexasReference,
  isValidRetakeToken,
  matchesExamLines,
  prepareRetakeRegistration,
  SCHEDULED_EXAM_DOMAINS,
} from '../scheduledExam';

const makeQuestion = (id: string, domain: string, question = 'Pregunta'): SessionQuestion => ({
  id, domain, question, difficulty: 'medium', options: ['A', 'B'], correctAnswer: 'A', shuffledOptions: ['A', 'B'],
});

describe('scheduled exam slots', () => {
  it('offers hourly slots from 8 AM to 8 PM Central on both weekend days', () => {
    expect(examSlots).toHaveLength(26);
    expect(new Date(examSlots[0].startsAt).toISOString()).toBe('2026-10-24T13:00:00.000Z');
    expect(new Date(examSlots[25].startsAt).toISOString()).toBe('2026-10-26T01:00:00.000Z');
    expect(formatSlotLabel(examSlots[0], 'en')).toBe('Saturday, October 24 · 8:00 AM CT');
  });

  it('opens only during the start window', () => {
    const [slot] = examSlots;
    expect(getSlotState(slot, slot.startsAt - 1)).toBe('upcoming');
    expect(getSlotState(slot, slot.startsAt)).toBe('open');
    expect(getSlotState(slot, slot.endsAt)).toBe('closed');
  });
});

describe('scheduled exam retakes', () => {
  it('requires the configured token', () => {
    expect(isValidRetakeToken('luz-token', 'luz-token')).toBe(true);
    expect(isValidRetakeToken('wrong-token', 'luz-token')).toBe(false);
    expect(isValidRetakeToken(null, 'luz-token')).toBe(false);
    expect(isValidRetakeToken('', undefined)).toBe(false);
  });

  it('reopens a submitted registration without losing its completed-attempt count', () => {
    const submitted = {
      id: 'luz-registration',
      name: 'Luz Rivera',
      email: 'luz@example.com',
      slotId: examSlots[0].id,
      language: 'es' as const,
      lines: 'health' as const,
      registeredAt: 1,
      attempts: 1,
      submittedAt: 2,
    };

    expect(prepareRetakeRegistration(submitted)).toMatchObject({ id: 'luz-registration', attempts: 1, lines: 'health' });
    expect(prepareRetakeRegistration(submitted)).not.toHaveProperty('submittedAt');
  });
});

describe('scheduled exam lines', () => {
  it('uses only the explicit Florida line categories', () => {
    const common = makeQuestion('FLC-Q001', SCHEDULED_EXAM_DOMAINS.common);
    const life = makeQuestion('FLL-Q001', SCHEDULED_EXAM_DOMAINS.life);
    const health = makeQuestion('FLH-Q001', SCHEDULED_EXAM_DOMAINS.health);
    const legacy = makeQuestion('B10-Q001', 'Seguro de salud');

    expect([common, life, health, legacy].filter((q) => matchesExamLines(q, 'life')).map((q) => q.id)).toEqual(['FLC-Q001', 'FLL-Q001']);
    expect([common, life, health, legacy].filter((q) => matchesExamLines(q, 'health')).map((q) => q.id)).toEqual(['FLC-Q001', 'FLH-Q001']);
    expect([common, life, health, legacy].filter((q) => matchesExamLines(q, 'both')).map((q) => q.id)).toEqual(['FLC-Q001', 'FLL-Q001', 'FLH-Q001']);
  });

  it('passes repeated 70-question draws for every line and language', () => {
    const { questions, invalidCount } = loadScheduledExamQuestions();
    const languages = ['es', 'en'] as const;
    const lines = ['health', 'life', 'both'] as const;

    expect(invalidCount).toBe(0);
    expect(questions).toHaveLength(150);

    for (const language of languages) {
      for (const line of lines) {
        for (let draw = 0; draw < 100; draw += 1) {
          const session = buildScheduledExamSession(questions, line, language);
          const ids = session.map((question) => question.id);
          const stems = session.map((question) => question.question.trim().toLocaleLowerCase());
          const categories = session.map(getScheduledExamCategory);

          expect(session, `${language}/${line} draw ${draw}`).toHaveLength(70);
          expect(new Set(ids).size, `${language}/${line} duplicate ID in draw ${draw}`).toBe(70);
          expect(new Set(stems).size, `${language}/${line} duplicate question in draw ${draw}`).toBe(70);
          expect(ids.every((id) => /^FL(?:C|L|H)-Q\d+$/.test(id)), `${language}/${line} loaded a legacy bank`).toBe(true);
          expect(ids.every((id) => {
            const batch = /^B(\d+)-/i.exec(id);
            return !batch || Number(batch[1]) <= 9;
          }), `${language}/${line} loaded B10 or a later batch`).toBe(true);
          expect(categories.every(Boolean), `${language}/${line} included a non-Florida domain`).toBe(true);
          expect(session.every((question) => !hasTexasReference(question)), `${language}/${line} included Texas content`).toBe(true);

          if (line === 'health') expect(categories).not.toContain('life');
          if (line === 'life') expect(categories).not.toContain('health');
          if (line === 'both') expect(new Set(categories)).toEqual(new Set(['common', 'life', 'health']));
        }
      }
    }
  });
});

describe('scheduled exam report', () => {
  it('summarizes score, unanswered questions and tab switches', () => {
    const questions = [makeQuestion('1', 'Seguro de vida'), makeQuestion('2', 'Seguro de salud'), makeQuestion('3', 'Seguro de salud')];
    const report = buildExamReport({
      registration: { id: 'r1', name: 'Ana', email: 'ana@example.com', slotId: examSlots[0].id, language: 'es', lines: 'both', registeredAt: 0, attempts: 2 },
      questions, answers: { 1: 'A', 2: 'B' }, elapsedSeconds: 120, autoSubmitted: false, startedAt: 0, tabSwitches: 2, preview: false,
    });

    expect(report).toMatchObject({ type: 'submitted', attempt: 2, score: 33, correct: 1, incorrect: 1, unanswered: 1, total: 3, tabSwitches: 2 });
  });
});
