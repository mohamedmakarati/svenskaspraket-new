import { describe, it, expect } from 'vitest';
import { B2C1_LESSON, getB2C1Stats, flattenB2C1Entries } from '../src/data/lesson-b2c1.js';

describe('B2/C1 Rivstart lesson', () => {
  it('exports 162 source entries across four Quizlet sets', () => {
    const entries = flattenB2C1Entries();
    const stats = getB2C1Stats();
    expect(entries).toHaveLength(162);
    expect(stats.sourceEntries).toBe(162);
    expect(stats.uniqueSwedish).toBeGreaterThanOrEqual(148);
    expect(B2C1_LESSON.creatorCredit).toMatch(/AnnaRansheim/);
    expect(B2C1_LESSON.sets).toHaveLength(4);
    expect(B2C1_LESSON.sets.some((s) => s.sourceUrl.includes('_8n3678'))).toBe(true);
    expect(B2C1_LESSON.sets.some((s) => s.sourceUrl.includes('_8mq3xa'))).toBe(true);
  });

  it('preserves duplicate entries across sets when source repeats them', () => {
    const entries = flattenB2C1Entries();
    expect(entries.filter((e) => e.sv.startsWith('uppskattar'))).toHaveLength(2);
    expect(entries.filter((e) => e.sv.startsWith('förknippar'))).toHaveLength(2);
    expect(entries.filter((e) => e.sv.startsWith('uppger'))).toHaveLength(2);
  });
});
