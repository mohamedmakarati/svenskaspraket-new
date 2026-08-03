/**
 * Load all educational source files (read-only — never modifies sources).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './env.mjs';
import {
  verbSourceKey,
  verbSlug,
  vocabSourceKey,
  vocabSlug,
  lessonSourceKey,
  lessonSlug,
  quizSourceKey,
  normalizeImagePath,
  slugify,
} from './slug.mjs';

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(ROOT, relativePath), 'utf8'));
}

function mapA1Verb(v) {
  return {
    kind: 'verb',
    source_key: verbSourceKey('a1', v.id),
    slug: verbSlug('a1', v.id, v.infinitive),
    cefr_level: 'A1',
    infinitive: v.infinitive,
    imperative: v.imperative ?? null,
    present: v.present ?? null,
    preterite: v.preterite ?? null,
    supine: v.supine ?? null,
    verb_group: v.group ?? null,
    meaning_en: v.english ?? null,
    meaning_ar: v.arabic ?? null,
    image_path: normalizeImagePath(v.image),
    status: 'published',
    _source: { file: 'public/verbs-data.json', id: v.id },
  };
}

function mapA2Verb(v) {
  return {
    kind: 'verb',
    source_key: verbSourceKey('a2', v.id),
    slug: verbSlug('a2', v.id, v.infinitive),
    cefr_level: 'A2',
    infinitive: v.infinitive,
    imperative: v.imperative?.replace(/!$/, '') ?? null,
    present: v.present ?? null,
    preterite: v.preterite ?? null,
    supine: v.supine ?? null,
    verb_group: v.group ?? null,
    meaning_en: v.en ?? null,
    meaning_ar: v.ar ?? null,
    image_path: normalizeImagePath(v.image),
    status: 'published',
    _source: { file: 'public/verbs-a2-data.json', id: v.id },
  };
}

function mapB2Verb(v) {
  return {
    kind: 'verb',
    source_key: verbSourceKey('b2', v.id),
    slug: verbSlug('b2', v.id, v.infinitive),
    cefr_level: 'B2',
    infinitive: v.infinitive,
    imperative: v.imperative?.replace(/!$/, '') ?? null,
    present: v.present ?? null,
    preterite: v.preterite ?? null,
    supine: v.supine ?? null,
    verb_group: v.group ?? null,
    meaning_en: v.en ?? null,
    meaning_ar: v.ar ?? null,
    image_path: normalizeImagePath(v.image),
    status: 'published',
    _source: { file: 'public/verbs-b1b2-data.json', id: v.id },
  };
}

function mapAuxiliary(a, index) {
  const id = index + 1;
  return {
    kind: 'verb',
    source_key: verbSourceKey('a1', id, 'aux'),
    slug: `verb-a1-aux-${String(id).padStart(2, '0')}-${slugify(a.swedish)}`,
    cefr_level: 'A1',
    infinitive: a.swedish,
    imperative: null,
    present: null,
    preterite: null,
    supine: null,
    verb_group: 'auxiliary',
    meaning_en: a.english ?? null,
    meaning_ar: a.arabic ?? null,
    image_path: null,
    status: 'published',
    _source: { file: 'public/verbs-data.json', auxiliary: id },
  };
}

function mapVocab(w) {
  return {
    kind: 'vocabulary',
    source_key: vocabSourceKey(w.id),
    slug: vocabSlug(w.id, w.sv),
    word_sv: w.sv,
    meaning_en: w.en ?? null,
    meaning_ar: w.ar ?? null,
    cefr_level: 'B2',
    category: 'general',
    status: 'published',
    _source: { file: 'public/quizlet-vocabulary.json', id: w.id },
  };
}

function mapLesson(level, lesson) {
  const cefr = level === 'A1' ? 'A1' : 'B2';
  const key = lessonSourceKey(cefr, lesson.number);
  const contentPayload = {
    version: 1,
    rules: lesson.rules ?? (lesson.rule_sv ? [{ title: 'Rule', sv: lesson.rule_sv }] : []),
    subjectTable: lesson.subjectTable ?? null,
    objectTable: lesson.objectTable ?? null,
    examples: lesson.examples ?? [],
  };

  return {
    kind: 'lesson',
    source_key: key,
    slug: lessonSlug(cefr, lesson.number, lesson.title_sv),
    title_sv: lesson.title_sv,
    title_en: lesson.title_en ?? null,
    title_ar: lesson.title_ar ?? null,
    summary_sv: lesson.subtitle_sv ?? null,
    summary_en: lesson.support_en ?? null,
    summary_ar: lesson.support_ar ?? null,
    content_sv: JSON.stringify(contentPayload),
    content_en: lesson.support_en ?? null,
    content_ar: lesson.support_ar ?? null,
    cefr_level: cefr,
    category: 'grammar',
    sort_order: lesson.number,
    status: 'published',
    quizzes: (lesson.quiz ?? []).map((q, qi) => ({
      kind: 'quiz',
      source_key: quizSourceKey(key, qi + 1),
      question_sv: q.q,
      question_en: null,
      question_ar: null,
      answer_data: {
        type: 'multiple_choice',
        choices: q.choices ?? [],
        correct: q.answer,
      },
      difficulty: 'medium',
      status: 'published',
      lesson_source_key: key,
      _source: { lesson: key, index: qi + 1 },
    })),
    _source: { file: level === 'A1' ? 'src/data/lessons-a1.js' : 'src/data/lessons-b1.js', number: lesson.number },
  };
}

export async function loadAllSources() {
  const a1Json = readJson('public/verbs-data.json');
  const a2Json = readJson('public/verbs-a2-data.json');
  const b2Json = readJson('public/verbs-b1b2-data.json');
  const vocabJson = readJson('public/quizlet-vocabulary.json');

  const { lessonsA1 } = await import('../../src/data/lessons-a1.js');
  const { lessonsB1 } = await import('../../src/data/lessons-b1.js');

  const verbs = [
    ...a1Json.verbs.map(mapA1Verb),
    ...(a1Json.auxiliaries ?? []).map(mapAuxiliary),
    ...a2Json.map(mapA2Verb),
    ...b2Json.map(mapB2Verb),
  ];

  const vocabulary = vocabJson.map(mapVocab);
  const lessons = [
    ...lessonsA1.map((l) => mapLesson('A1', l)),
    ...lessonsB1.map((l) => mapLesson('B2', l)),
  ];
  const quizzes = lessons.flatMap((l) => l.quizzes ?? []);

  return {
    meta: {
      loadedAt: new Date().toISOString(),
      counts: { verbs: verbs.length, vocabulary: vocabulary.length, lessons: lessons.length, quizzes: quizzes.length },
    },
    verbs,
    vocabulary,
    lessons,
    quizzes,
  };
}
