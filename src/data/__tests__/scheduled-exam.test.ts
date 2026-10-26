import { describe, expect, it } from 'vitest';
import { loadScheduledExamQuestions } from '../loadQuestions';
import type { SessionQuestion } from '../../types/question';
import {
  buildExamReport,
  buildScheduledExamSession,
  examSlots,
  formatSlotLabel,
  getScheduledExamCategory,
  getScheduledExamModules,
  getScheduledExamPoolSizes,
  getSlotState,
  hasStateSpecificReference,
  isRetakeAccessActive,
  isValidRetakeToken,
  matchesExamLines,
  NEW_RETAKE_TOKENS_EXPIRE_AT,
  prepareRetakeRegistration,
  resolveRetakeAccess,
  SCHEDULED_EXAM_MODULES,
} from '../scheduledExam';
import englishTranslations from '../partialExam.en.json';

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

  it('expires a named token at the exact configured instant while leaving the legacy token unexpired', () => {
    const configs = [
      { token: 'luz-token' },
      { token: 'miriam-token', studentName: 'Miriam Bravo', expiresAt: NEW_RETAKE_TOKENS_EXPIRE_AT },
      { token: 'cynthia-token', studentName: 'Cynthia Villard', expiresAt: NEW_RETAKE_TOKENS_EXPIRE_AT },
    ];

    const active = resolveRetakeAccess('miriam-token', configs, NEW_RETAKE_TOKENS_EXPIRE_AT - 1);
    expect(active).toEqual({ status: 'active', studentName: 'Miriam Bravo', expiresAt: NEW_RETAKE_TOKENS_EXPIRE_AT });
    expect(isRetakeAccessActive(active, NEW_RETAKE_TOKENS_EXPIRE_AT - 1)).toBe(true);

    const expired = resolveRetakeAccess('miriam-token', configs, NEW_RETAKE_TOKENS_EXPIRE_AT);
    expect(expired?.status).toBe('expired');
    expect(isRetakeAccessActive(expired, NEW_RETAKE_TOKENS_EXPIRE_AT)).toBe(false);

    expect(resolveRetakeAccess('luz-token', configs, NEW_RETAKE_TOKENS_EXPIRE_AT + 10_000)).toEqual({
      status: 'active', studentName: undefined, expiresAt: undefined,
    });
    expect(resolveRetakeAccess('cynthia-token', configs, NEW_RETAKE_TOKENS_EXPIRE_AT - 1)).toEqual({
      status: 'active', studentName: 'Cynthia Villard', expiresAt: NEW_RETAKE_TOKENS_EXPIRE_AT,
    });
    expect(resolveRetakeAccess('unknown-token', configs)).toBeNull();
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
    expect(prepareRetakeRegistration(submitted, 'Miriam Bravo')).toBeNull();
  });
});

describe('scheduled exam lines', () => {
  it('maps configured module topics to Life, Health, and common lines', () => {
    expect(SCHEDULED_EXAM_MODULES).toEqual({
      life: [1], provisions: [2, 6], application: [3, 9], retirement: [4, 7, 8], health: [5],
    });

    const life = makeQuestion('B01-Q901', 'Seguro de vida');
    const health = makeQuestion('B01-Q902', 'Seguro de salud');
    const common = makeQuestion('B01-Q903', 'Disposiciones de la póliza');
    const module10 = makeQuestion('B10-Q001', 'Seguro de salud');

    expect([life, health, common, module10].filter((q) => matchesExamLines(q, 'life')).map((q) => q.id)).toEqual(['B01-Q901', 'B01-Q903']);
    expect([life, health, common, module10].filter((q) => matchesExamLines(q, 'health')).map((q) => q.id)).toEqual(['B01-Q902', 'B01-Q903']);
    expect([life, health, common, module10].filter((q) => matchesExamLines(q, 'both')).map((q) => q.id)).toEqual(['B01-Q901', 'B01-Q902', 'B01-Q903']);
  });

  it('rejects state references from every question field', () => {
    const base = makeQuestion('B01-Q950', 'Disposiciones de la póliza');
    const stateQuestions = [
      { ...base, question: 'Según la ley de Texas, ¿qué aplica?' },
      { ...base, id: 'B01-Q951', options: ['Florida', 'Ninguno'] },
      { ...base, id: 'B01-Q952', explanation: 'La guía de TDI controla esta regla.' },
      { ...base, id: 'B01-Q953', optionExplanations: { A: 'Consulte al DFS.' } },
      { ...base, id: 'B01-Q954', citation: 'OIR bulletin 2026-01' },
      { ...base, id: 'B01-Q955', domain: 'State Statutes' },
    ];

    expect(stateQuestions.every(hasStateSpecificReference)).toBe(true);
    expect(hasStateSpecificReference({ ...base, id: 'B01-Q956', question: '¿Qué exige la ley federal COBRA?' })).toBe(false);
  });

  it('passes repeated 70-question draws for every line and language', () => {
    const { questions, invalidCount } = loadScheduledExamQuestions();
    const languages = ['es', 'en'] as const;
    const lines = ['health', 'life', 'both'] as const;

    expect(invalidCount).toBe(0);
    expect(questions).toHaveLength(200);
    expect(questions.every((question) => /^B(?:0?[1-9])-Q\d+$/i.test(question.id))).toBe(true);
    expect(getScheduledExamPoolSizes(questions, 'es')).toEqual({ both: 120, life: 112, health: 87 });
    expect(getScheduledExamPoolSizes(questions, 'en')).toEqual({ both: 120, life: 112, health: 87 });

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
          expect(ids.every((id) => /^B(?:0?[1-9])-Q\d+$/i.test(id)), `${language}/${line} loaded batch 10+ or a non-general bank`).toBe(true);
          expect(categories.every(Boolean), `${language}/${line} included a domain outside modules 1–9`).toBe(true);
          expect(session.flatMap(getScheduledExamModules).every((module) => module <= 9), `${language}/${line} included module 10+`).toBe(true);
          expect(session.every((question) => !hasStateSpecificReference(question)), `${language}/${line} included state-specific content`).toBe(true);

          if (line === 'health') expect(categories).not.toContain('life');
          if (line === 'life') expect(categories).not.toContain('health');
          if (language === 'en') {
            for (const question of session) {
              const translation = (englishTranslations as Record<string, { question?: string }>)[question.id];
              if (translation?.question) expect(question.question).toBe(translation.question);
            }
          }
        }
      }
    }
  });

  it('falls back to Spanish when an English translation is unavailable', () => {
    const spanishOnly = Array.from({ length: 70 }, (_, index) => makeQuestion(
      `B01-Q${String(500 + index).padStart(3, '0')}`,
      'Disposiciones de la póliza',
      `Pregunta solo en español ${index}`,
    ));
    const session = buildScheduledExamSession(spanishOnly, 'both', 'en');

    expect(session).toHaveLength(70);
    expect(session.every((question) => question.question.startsWith('Pregunta solo en español'))).toBe(true);
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
