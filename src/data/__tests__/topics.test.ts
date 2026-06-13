import { describe, it, expect } from 'vitest';
import topics from '../topics.json';
import { loadQuestions } from '../loadQuestions';

const topicMap = topics as Record<string, string[]>;

describe('topic -> domain mapping (src/data/topics.json)', () => {
  const { questions } = loadQuestions();
  const bankDomains = new Set(questions.map((q) => q.domain));

  it('only references domain names that exist in the question bank', () => {
    const orphans: string[] = [];
    for (const domains of Object.values(topicMap)) {
      for (const d of domains) {
        if (!bankDomains.has(d)) orphans.push(d);
      }
    }
    // A stale or misspelled domain would silently hide questions from a module.
    expect(orphans).toEqual([]);
  });

  it('resolves every topic to at least one question', () => {
    for (const [slug, domains] of Object.entries(topicMap)) {
      const count = questions.filter((q) => domains.includes(q.domain)).length;
      expect(count, `topic "${slug}" matched no questions`).toBeGreaterThan(0);
    }
  });
});
