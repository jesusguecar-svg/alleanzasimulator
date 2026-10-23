import { describe, expect, it } from 'vitest';
import { buildPartialExamSession, getPartialExamDomain, PARTIAL_EXAM_MAX_QUESTIONS } from '../partialExam';
import type { NormalizedQuestion } from '../../types/question';

const makeQuestion = (id: string, domain: string): NormalizedQuestion => ({
  id,
  domain,
  difficulty: 'medium',
  question: `Pregunta ${id}`,
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 'A',
});

describe('partial exam session', () => {
  it('only includes module 1–9 domains and caps the session at 75 questions', () => {
    const domains = [
      'Seguro de vida',
      'Cláusulas adicionales, disposiciones, opciones y exclusiones de la póliza',
      'Completar la solicitud, suscripción y entrega de la póliza',
      'Impuestos, jubilación y otros conceptos de seguros',
      'Seguro de salud',
    ];
    const eligible = Array.from({ length: 100 }, (_, index) => makeQuestion(`q-${index}`, domains[index % domains.length]));
    const unrelated = makeQuestion('texas-only', 'Estatutos de Texas');

    const session = buildPartialExamSession([...eligible, unrelated]);

    expect(session).toHaveLength(PARTIAL_EXAM_MAX_QUESTIONS);
    expect(session.some((question) => question.id === unrelated.id)).toBe(false);
    expect(session.every((question) => getPartialExamDomain(question))).toBe(true);
  });

  it('uses all available eligible questions when fewer than requested exist', () => {
    const questions = [makeQuestion('life', 'Seguro de vida'), makeQuestion('health', 'Seguro de salud')];
    expect(buildPartialExamSession(questions)).toHaveLength(2);
  });

  it('applies the packaged English question content when English is selected', () => {
    const spanish = makeQuestion('B01-Q001', 'Seguro de vida');
    const [english] = buildPartialExamSession([spanish], 1, 'en');

    expect(english.question).toContain('life insurance policy');
    expect(english.question).not.toContain('póliza');
    expect(english.options).toContain('March 11');
    expect(english.correctAnswer).toBe('March 11');
  });
});
