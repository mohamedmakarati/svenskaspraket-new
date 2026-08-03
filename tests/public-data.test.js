import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  parseLessonContent,
  mapDbQuizToGrammar,
  normalizeLessonFromStatic,
} from '../src/lib/lessonContent.js';

const root = resolve(import.meta.dirname, '..');

describe('lesson content', () => {
  it('parses JSON lesson payload', () => {
    const payload = { rules: [{ sv: 'Test' }], examples: [] };
    const parsed = parseLessonContent(JSON.stringify(payload));
    expect(parsed.rules[0].sv).toBe('Test');
  });

  it('maps DB quiz to grammar format', () => {
    const q = mapDbQuizToGrammar({
      id: '1',
      question_sv: '___ heter Anna.',
      answer_data: { choices: ['Jag', 'Du'], correct: 'Jag' },
    });
    expect(q.answer).toBe('Jag');
    expect(q.choices).toHaveLength(2);
  });

  it('normalizes static lesson with Swedish characters', () => {
    const lesson = normalizeLessonFromStatic(
      { number: 1, title_sv: 'Personliga pronomen', subtitle_sv: 'Test', quiz: [] },
      'A1',
    );
    expect(lesson.title_sv).toBe('Personliga pronomen');
    expect(lesson._source).toBe('static');
  });
});

describe('static source files (read-only)', () => {
  it('has expected verb and vocabulary counts', () => {
    const verbs = JSON.parse(readFileSync(resolve(root, 'public/verbs-data.json'), 'utf8'));
    const vocab = JSON.parse(readFileSync(resolve(root, 'public/quizlet-vocabulary.json'), 'utf8'));
    expect(verbs.verbs.length).toBe(131);
    expect(vocab.length).toBe(805);
  });

  it('preserves Arabic unicode in vocabulary JSON', () => {
    const vocab = JSON.parse(readFileSync(resolve(root, 'public/quizlet-vocabulary.json'), 'utf8'));
    expect(vocab.some((w) => /[\u0600-\u06FF]/.test(w.ar ?? ''))).toBe(true);
  });

  it('preserves Swedish characters in verb JSON', () => {
    const verbs = JSON.parse(readFileSync(resolve(root, 'public/verbs-data.json'), 'utf8'));
    const beratta = verbs.verbs.find((v) => v.infinitive === 'berätta');
    expect(beratta).toBeTruthy();
  });
});
