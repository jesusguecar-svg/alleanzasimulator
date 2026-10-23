import { describe, expect, it } from 'vitest';
import type { SessionQuestion } from '../../types/question';
import { buildExamReport, examSlots, formatSlotLabel, getSlotState, matchesExamLines } from '../scheduledExam';

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

describe('scheduled exam lines', () => {
  it('splits shared domains by the question subject', () => {
    const life = makeQuestion('1', 'Seguro de vida');
    const health = makeQuestion('2', 'Seguro de salud');
    const sharedHealth = makeQuestion('3', 'Disposiciones de la póliza', 'Una póliza de discapacidad tiene un período de eliminación…');
    const sharedLife = makeQuestion('4', 'Disposiciones de la póliza', 'El período de gracia de una póliza de vida…');

    expect([life, health, sharedHealth, sharedLife].filter((q) => matchesExamLines(q, 'life')).map((q) => q.id)).toEqual(['1', '4']);
    expect([life, health, sharedHealth, sharedLife].filter((q) => matchesExamLines(q, 'health')).map((q) => q.id)).toEqual(['2', '3']);
    expect([life, health].every((q) => matchesExamLines(q, 'both'))).toBe(true);
  });
});

describe('scheduled exam report', () => {
  it('summarizes score, unanswered questions and tab switches', () => {
    const questions = [makeQuestion('1', 'Seguro de vida'), makeQuestion('2', 'Seguro de salud'), makeQuestion('3', 'Seguro de salud')];
    const report = buildExamReport({
      registration: { id: 'r1', name: 'Ana', email: 'ana@example.com', slotId: examSlots[0].id, language: 'es', lines: 'both', registeredAt: 0, attempts: 1 },
      questions, answers: { 1: 'A', 2: 'B' }, elapsedSeconds: 120, autoSubmitted: false, startedAt: 0, tabSwitches: 2, preview: false,
    });

    expect(report).toMatchObject({ type: 'submitted', score: 33, correct: 1, incorrect: 1, unanswered: 1, total: 3, tabSwitches: 2 });
  });
});
