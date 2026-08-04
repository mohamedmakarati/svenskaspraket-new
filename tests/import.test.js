import { describe, it, expect } from 'vitest';
import { loadAllSources } from '../scripts/import/load-sources.mjs';
import { validateDataset, verifyUnicodeSamples } from '../scripts/import/validate.mjs';

describe('content import', () => {
  it('loads expected record counts from source files', async () => {
    const data = await loadAllSources();
    expect(data.verbs.length).toBe(131 + 9 + 199 + 135 + 62);
    expect(data.vocabulary.length).toBe(805 + 61 + 28 + 11 + 40);
    expect(data.lessons.length).toBe(6);
    expect(data.quizzes.length).toBeGreaterThan(0);
    expect(data.meta.counts.b2c1Draft).toBe(202);
  });

  it('validates dataset with no hard failures on slugs', async () => {
    const data = await loadAllSources();
    const report = validateDataset(data);
    expect(report.summary.validVerbs).toBe(474 + 62);
    expect(report.summary.validVocabulary).toBe(805 + 61 + 28 + 11 + 40);
    expect(report.summary.validLessons).toBe(6);
    expect(report.duplicates.filter((d) => d.message.includes('source_key'))).toHaveLength(0);
  });

  it('preserves Swedish and Arabic unicode in samples', async () => {
    const data = await loadAllSources();
    const samples = verifyUnicodeSamples(data);
    expect(samples.some((s) => /[åäö]/i.test(s.value ?? ''))).toBe(true);
    expect(samples.some((s) => /[\u0600-\u06FF]/.test(s.value ?? ''))).toBe(true);
  });
});
