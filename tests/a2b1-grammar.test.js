import { describe, it, expect } from 'vitest';
import { a2b1GrammarLesson, a2b1GrammarMeta } from '../src/data/lesson-a2b1-grammar.js';

describe('A2–B1 grammar lesson', () => {
  it('exports lesson sections and quiz', () => {
    expect(a2b1GrammarMeta.canonical).toBe('/lessons-a2-b1');
    expect(a2b1GrammarLesson.sections.length).toBeGreaterThanOrEqual(8);
    expect(a2b1GrammarLesson.quiz.length).toBeGreaterThanOrEqual(5);
    expect(a2b1GrammarLesson.sections.some((s) => s.id === 'word-classes')).toBe(true);
  });
});
