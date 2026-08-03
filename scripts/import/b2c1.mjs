/**
 * Map Rivstart B2/C1 lesson pack → import rows (draft until licensing confirmed).
 */
import { B2C1_LESSON, flattenB2C1Entries } from '../../src/data/lesson-b2c1.js';
import { slugify } from './slug.mjs';

export function b2c1VocabSourceKey(setId, n) {
  return `b2c1:vocab:${setId}:${String(n).padStart(3, '0')}`;
}

export function b2c1VerbSourceKey(setId, n) {
  return `b2c1:verb:${setId}:${String(n).padStart(3, '0')}`;
}

export function mapB2C1ImportRows() {
  const entries = flattenB2C1Entries();
  const vocabulary = [];
  const verbs = [];

  for (const e of entries) {
    const base = {
      word_sv: e.sv,
      meaning_en: e.en,
      meaning_ar: e.ar,
      cefr_level: 'B2',
      category: e.setId === 'verbs1to3' ? 'rivstart-b2c1-verb' : 'rivstart-b2c1-vocab',
      status: 'draft',
      _source: {
        pack: 'import/b2c1-lesson',
        setId: e.setId,
        n: e.n,
        sourceUrl: e.sourceUrl,
        creator: 'AnnaRansheim',
      },
    };

    if (e.setId === 'verbs1to3') {
      verbs.push({
        kind: 'verb',
        source_key: b2c1VerbSourceKey(e.setId, e.n),
        slug: `b2c1-verb-${String(e.n).padStart(3, '0')}-${slugify(e.sv.slice(0, 40))}`,
        infinitive: e.sv.split(',')[0].split(' (')[0].trim(),
        imperative: null,
        present: null,
        preterite: null,
        supine: null,
        verb_group: 'rivstart-b2c1',
        meaning_en: e.en,
        meaning_ar: e.ar,
        image_path: null,
        status: 'draft',
        _source: base._source,
      });
    } else {
      vocabulary.push({
        kind: 'vocabulary',
        source_key: b2c1VocabSourceKey(e.setId, e.n),
        slug: `b2c1-vocab-${slugify(e.setId)}-${String(e.n).padStart(3, '0')}-${slugify(e.sv.slice(0, 40))}`,
        ...base,
      });
    }
  }

  const stats = {
    sourceEntries: entries.length,
    uniqueSwedish: new Set(entries.map((x) => x.sv.toLowerCase())).size,
  };

  const lesson = {
    kind: 'lesson',
    source_key: 'lesson:b2c1:rivstart',
    slug: 'lesson-b2c1-rivstart-kapitel-1-3',
    title_sv: B2C1_LESSON.title,
    title_en: 'Rivstart B2/C1 – Chapters 1–3: words and verbs',
    title_ar: 'Rivstart B2/C1 – الفصول 1–3: كلمات وأفعال',
    summary_sv: B2C1_LESSON.creatorCredit,
    summary_en: 'Quizlet sets by AnnaRansheim — independent study adaptation.',
    summary_ar: 'مجموعات Quizlet من AnnaRansheim — تكييف دراسي مستقل.',
    content_sv: JSON.stringify({
      version: 1,
      creatorCredit: B2C1_LESSON.creatorCredit,
      disclaimer: B2C1_LESSON.disclaimer,
      sets: B2C1_LESSON.sets.map((s) => ({ id: s.id, title: s.title, sourceUrl: s.sourceUrl })),
      stats,
    }),
    cefr_level: 'B2',
    category: 'rivstart-b2c1',
    sort_order: 10,
    status: 'draft',
    _source: { file: 'import/b2c1-lesson/lesson-data.js' },
  };

  return { vocabulary, verbs, lesson, meta: { entries: entries.length } };
}
