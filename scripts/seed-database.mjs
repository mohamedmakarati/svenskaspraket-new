/**
 * Seed Supabase from static JSON files.
 * Requires SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL in .env
 *
 * Usage: npm run seed
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  try {
    const env = readFileSync(resolve(root, '.env'), 'utf8');
    env.split('\n').forEach((line) => {
      const [k, ...v] = line.split('=');
      if (k && v.length && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join('=').trim();
      }
    });
  } catch {
    /* no .env */
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || url.includes('your-project')) {
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8'));
}

async function seedVerbs() {
  const a1 = readJson('public/verbs-data.json');
  const rows = a1.verbs.map((v) => ({
    legacy_id: v.id,
    level: 'A1',
    verb_group: v.group,
    imperative: v.imperative,
    infinitive: v.infinitive,
    present: v.present,
    preterite: v.preterite,
    supine: v.supine,
    content_en: v.english,
    content_ar: v.arabic,
    image_path: v.image?.replace('./', '/'),
    status: 'published',
  }));

  const a2 = readJson('public/verbs-a2-data.json');
  rows.push(
    ...a2.map((v) => ({
      legacy_id: v.id,
      level: 'A2',
      verb_group: v.group,
      imperative: v.imperative,
      infinitive: v.infinitive,
      present: v.present,
      preterite: v.preterite,
      supine: v.supine,
      content_en: v.en,
      content_ar: v.ar,
      image_path: v.image?.replace('./', '/'),
      status: 'published',
    })),
  );

  const b1 = readJson('public/verbs-b1b2-data.json');
  rows.push(
    ...b1.map((v) => ({
      legacy_id: v.id,
      level: 'B1-B2',
      verb_group: v.group,
      imperative: v.imperative,
      infinitive: v.infinitive,
      present: v.present,
      preterite: v.preterite,
      supine: v.supine,
      content_en: v.en,
      content_ar: v.ar,
      image_path: v.image?.replace('./', '/'),
      status: 'published',
    })),
  );

  // Auxiliaries
  rows.push(
    ...a1.auxiliaries.map((a, i) => ({
      legacy_id: 1000 + i,
      level: 'A1',
      infinitive: a.swedish,
      content_sv: a.swedish,
      content_en: a.english,
      content_ar: a.arabic,
      is_auxiliary: true,
      status: 'published',
    })),
  );

  const { error } = await supabase.from('verbs').upsert(rows, { onConflict: 'legacy_id,level', ignoreDuplicates: false });
  if (error) console.warn('Verbs upsert note:', error.message);
  else console.log(`Seeded ${rows.length} verbs`);
}

async function seedVocabulary() {
  const words = readJson('public/quizlet-vocabulary.json');
  const rows = words.map((w) => ({
    legacy_id: w.id,
    content_sv: w.sv,
    content_en: w.en,
    content_ar: w.ar,
    level: 'B1-B2',
    status: 'published',
  }));
  const { error } = await supabase.from('vocabulary').upsert(rows, { onConflict: 'legacy_id' });
  if (error) console.warn('Vocabulary:', error.message);
  else console.log(`Seeded ${rows.length} vocabulary items`);
}

async function seedLessons() {
  const lessons = [
    {
      slug: 'personliga-pronomen-a1',
      title_sv: 'Personliga pronomen',
      title_en: 'Personal pronouns',
      title_ar: 'الضمائر الشخصية',
      description_sv: 'Subjekt- och objektpronomen på svenska',
      level: 'A1',
      lesson_number: 1,
      status: 'published',
    },
    {
      slug: 'substantiv-b1b2',
      title_sv: 'Substantiv steg för steg',
      title_en: 'Nouns step by step',
      title_ar: 'الأسماء خطوة بخطوة',
      description_sv: 'Sammansatta substantiv, genitiv, bestämd/obestämd form',
      level: 'B1-B2',
      lesson_number: 1,
      status: 'published',
    },
  ];
  const { error } = await supabase.from('lessons').upsert(lessons, { onConflict: 'slug' });
  if (error) console.warn('Lessons:', error.message);
  else console.log(`Seeded ${lessons.length} lessons`);
}

async function seedSeo() {
  const pages = [
    { resource_type: 'page', slug: '/', title: 'Lär dig svenska A1-B2 gratis | SvenskaSpråket', description: '465 verb, 805 ord, grammatik och quiz', canonical_url: 'https://svenskaspraket.com/', status: 'published' },
    { resource_type: 'page', slug: '/verbs', title: '131 svenska A1-verb', canonical_url: 'https://svenskaspraket.com/verbs', status: 'published' },
    { resource_type: 'page', slug: '/vocabulary', title: '805 svenska ord', canonical_url: 'https://svenskaspraket.com/vocabulary', status: 'published' },
  ];
  const { error } = await supabase.from('seo_metadata').upsert(pages, { onConflict: 'slug' });
  if (error) console.warn('SEO:', error.message);
  else console.log(`Seeded ${pages.length} SEO records`);
}

async function main() {
  console.log('Seeding SvenskaSpråket database…');
  await seedVerbs();
  await seedVocabulary();
  await seedLessons();
  await seedSeo();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
