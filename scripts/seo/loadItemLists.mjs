/**
 * Load verb/vocabulary samples for ItemList JSON-LD at build time.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

export function loadVerbItems(level) {
  const paths = {
    A1: 'public/verbs-data.json',
    A2: 'public/verbs-a2-data.json',
    'B1-B2': 'public/verbs-b1b2-data.json',
  };
  const file = paths[level];
  if (!file) return [];
  const json = JSON.parse(readFileSync(resolve(root, file), 'utf8'));
  const verbs = Array.isArray(json) ? json : json.verbs ?? [];
  return verbs.map((v, i) => ({
    position: i + 1,
    name: v.infinitive,
    url: `#${v.infinitive}`,
  }));
}

export function loadVocabularyItems(limit = 50) {
  const json = JSON.parse(readFileSync(resolve(root, 'public/quizlet-vocabulary.json'), 'utf8'));
  return json.slice(0, limit).map((w, i) => ({
    position: i + 1,
    name: w.sv,
    description: w.en,
  }));
}
