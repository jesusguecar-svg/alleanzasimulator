import { describe, it, expect } from 'vitest';
import { normalizeQuestion } from '../normalizeQuestions';
import { validateQuestions } from '../validateQuestions';

describe('question data', () => {
  it('normalizes schema variants', () => {
    const q = normalizeQuestion({ id: '1', domain: 'A', question: 'Q', choices: ['x', 'y'], answer: 'x' });
    expect(q.options).toEqual(['x', 'y']);
    expect(q.correctAnswer).toBe('x');
  });

  it('validates required fields', () => {
    const { valid, invalid } = validateQuestions([
      normalizeQuestion({ id: '1', domain: 'A', question: 'Q', options: ['x', 'y'], correctAnswer: 'x' }),
      normalizeQuestion({ id: '2', question: '', options: ['a', 'b'], correctAnswer: 'a' }),
    ]);
    expect(valid).toHaveLength(1);
    expect(invalid).toHaveLength(1);
  });
});
