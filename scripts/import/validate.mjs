/**
 * Validate import records before writing to Supabase.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './env.mjs';
import { slugify } from './slug.mjs';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function issue(report, category, record, message) {
  report[category].push({
    source_key: record.source_key ?? record.slug,
    slug: record.slug,
    message,
    _source: record._source,
  });
}

function validateVerb(record, report) {
  if (!record.infinitive?.trim()) {
    issue(report, 'invalidVerbForms', record, 'Missing infinitive');
    report.summary.skipped++;
    return false;
  }
  if (!record.slug || !SLUG_RE.test(record.slug)) {
    issue(report, 'skipped', record, `Invalid slug: ${record.slug}`);
    report.summary.skipped++;
    return false;
  }
  if (!record.meaning_en?.trim()) issue(report, 'missingTranslations', record, 'Missing English meaning');
  if (!record.meaning_ar?.trim()) issue(report, 'missingTranslations', record, 'Missing Arabic meaning');

  const isAux = record.verb_group === 'auxiliary';
  if (!isAux) {
    if (!record.present?.trim()) issue(report, 'invalidVerbForms', record, 'Missing present tense');
    if (!record.preterite?.trim()) issue(report, 'invalidVerbForms', record, 'Missing preterite');
    if (!record.supine?.trim()) issue(report, 'invalidVerbForms', record, 'Missing supine');
  }

  if (record.image_path) {
    const local = resolve(ROOT, 'public', record.image_path.replace(/^\//, ''));
    if (!existsSync(local)) {
      issue(report, 'missingImages', record, `Image not found: ${record.image_path}`);
    }
  } else if (!isAux) {
    issue(report, 'missingImages', record, 'No image_path');
  }

  return true;
}

function validateVocab(record, report) {
  if (!record.word_sv?.trim()) {
    issue(report, 'skipped', record, 'Missing Swedish word');
    report.summary.skipped++;
    return false;
  }
  if (!record.slug || !SLUG_RE.test(record.slug)) {
    issue(report, 'skipped', record, `Invalid slug: ${record.slug}`);
    report.summary.skipped++;
    return false;
  }
  if (!record.meaning_en?.trim()) issue(report, 'missingTranslations', record, 'Missing English');
  if (!record.meaning_ar?.trim()) issue(report, 'missingTranslations', record, 'Missing Arabic');
  return true;
}

function validateLesson(record, report) {
  if (!record.title_sv?.trim()) {
    issue(report, 'skipped', record, 'Missing Swedish title');
    report.summary.skipped++;
    return false;
  }
  if (!record.slug || !SLUG_RE.test(record.slug)) {
    issue(report, 'skipped', record, `Invalid slug: ${record.slug}`);
    report.summary.skipped++;
    return false;
  }
  if (!record.summary_en?.trim()) issue(report, 'missingTranslations', record, 'Missing English summary');
  if (!record.summary_ar?.trim()) issue(report, 'missingTranslations', record, 'Missing Arabic summary');
  return true;
}

function validateQuiz(record, report) {
  if (!record.question_sv?.trim()) {
    issue(report, 'skipped', record, 'Missing question');
    report.summary.skipped++;
    return false;
  }
  const choices = record.answer_data?.choices ?? [];
  if (choices.length < 2) {
    issue(report, 'skipped', record, 'Quiz needs at least 2 choices');
    report.summary.skipped++;
    return false;
  }
  if (!record.answer_data?.correct) {
    issue(report, 'skipped', record, 'Missing correct answer');
    report.summary.skipped++;
    return false;
  }
  return true;
}

function detectDuplicates(records, keyFn, report, label) {
  const seen = new Map();
  for (const r of records) {
    const k = keyFn(r);
    if (seen.has(k)) {
      issue(report, 'duplicates', r, `Duplicate ${label}: ${k} (also ${seen.get(k).source_key})`);
    } else {
      seen.set(k, r);
    }
  }
}

export function validateDataset(data) {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      verbs: data.verbs.length,
      vocabulary: data.vocabulary.length,
      lessons: data.lessons.length,
      quizzes: data.quizzes.length,
      validVerbs: 0,
      validVocabulary: 0,
      validLessons: 0,
      validQuizzes: 0,
      skipped: 0,
      imported: 0,
      updated: 0,
      imagesUploaded: 0,
      imagesSkipped: 0,
    },
    imported: [],
    updated: [],
    skipped: [],
    duplicates: [],
    missingTranslations: [],
    invalidVerbForms: [],
    missingImages: [],
    valid: { verbs: [], vocabulary: [], lessons: [], quizzes: [] },
  };

  detectDuplicates(data.verbs, (r) => r.source_key, report, 'source_key');
  detectDuplicates(data.verbs, (r) => r.slug, report, 'slug');
  detectDuplicates(data.vocabulary, (r) => r.source_key, report, 'source_key');
  detectDuplicates(data.vocabulary, (r) => `${r.word_sv}|${r.cefr_level}`.toLowerCase(), report, 'word+level');
  detectDuplicates(data.lessons, (r) => r.source_key, report, 'source_key');
  detectDuplicates(data.quizzes, (r) => r.source_key, report, 'source_key');

  for (const v of data.verbs) {
    if (validateVerb(v, report)) {
      report.valid.verbs.push(stripInternal(v));
      report.summary.validVerbs++;
    }
  }
  for (const w of data.vocabulary) {
    if (validateVocab(w, report)) {
      report.valid.vocabulary.push(stripInternal(w));
      report.summary.validVocabulary++;
    }
  }
  for (const l of data.lessons) {
    if (validateLesson(l, report)) {
      const { quizzes, ...lesson } = l;
      report.valid.lessons.push(stripInternal(lesson));
      report.summary.validLessons++;
    }
  }
  for (const q of data.quizzes) {
    if (validateQuiz(q, report)) {
      report.valid.quizzes.push(stripInternal(q));
      report.summary.validQuizzes++;
    }
  }

  return report;
}

function stripInternal(record) {
  const { _source, kind, quizzes, ...rest } = record;
  return rest;
}

export function verifyUnicodeSamples(data) {
  const samples = [];
  const v = data.verbs.find((x) => /[åäö]/i.test(x.infinitive ?? ''));
  if (v) samples.push({ field: 'infinitive', value: v.infinitive, slug: slugify(v.infinitive) });
  const w = data.vocabulary.find((x) => /[åäö]/i.test(x.word_sv ?? ''));
  if (w) samples.push({ field: 'word_sv', value: w.word_sv, slug: w.slug });
  const ar = data.vocabulary.find((x) => /[\u0600-\u06FF]/.test(x.meaning_ar ?? ''));
  if (ar) samples.push({ field: 'meaning_ar', value: ar.meaning_ar?.slice(0, 60) });
  return samples;
}
