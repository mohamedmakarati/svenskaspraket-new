#!/usr/bin/env node
/** Generate src/data/lesson-b2c1.js from import/b2c1-lesson/lesson-data.js */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(resolve(root, 'import/b2c1-lesson/lesson-data.js'), 'utf8');
const match = src.match(/window\.LESSON_DATA\s*=\s*(\{[\s\S]*\});/);
if (!match) throw new Error('Could not parse lesson-data.js');

const data = eval(`(${match[1]})`);

const out = `/** Rivstart B2/C1 — AnnaRansheim Quizlet sets. Page is noindex until licensing confirmed. */
export const B2C1_LESSON = ${JSON.stringify(data, null, 2)};

export function flattenB2C1Entries() {
  return B2C1_LESSON.sets.flatMap((set) =>
    set.entries.map(([n, sv, en, ar]) => ({
      id: \`\${set.id}-\${n}\`,
      setId: set.id,
      setTitle: set.title,
      sourceUrl: set.sourceUrl,
      n,
      sv,
      en,
      ar,
    })),
  );
}

export function getB2C1Stats() {
  const entries = flattenB2C1Entries();
  return {
    sourceEntries: entries.length,
    uniqueSwedish: new Set(entries.map((e) => e.sv.toLowerCase())).size,
  };
}

/** @deprecated use getB2C1Stats() */
export const B2C1_STATS = getB2C1Stats();
`;

writeFileSync(resolve(root, 'src/data/lesson-b2c1.js'), out);
console.log('✓ Wrote src/data/lesson-b2c1.js');
