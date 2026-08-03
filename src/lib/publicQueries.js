/**
 * Public read-only queries — Supabase first, static JSON fallback.
 * Only published content; never exposes profiles or drafts.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { resolveMediaUrl } from './media';
import {
  normalizeLessonFromDb,
  normalizeLessonFromStatic,
} from './lessonContent';

const VERB_SELECT =
  'id, slug, infinitive, imperative, present, preterite, supine, verb_group, cefr_level, meaning_en, meaning_ar, example_sv, example_en, example_ar, image_path, source_key';

const VOCAB_SELECT =
  'id, slug, word_sv, meaning_en, meaning_ar, example_sv, example_en, example_ar, word_class, cefr_level, category, image_path';

const LESSON_SELECT = `
  id, slug, title_sv, title_en, title_ar,
  summary_sv, summary_en, summary_ar,
  content_sv, content_en, content_ar,
  cefr_level, category, featured_image_path, sort_order,
  quiz_questions (
    id, question_sv, question_en, question_ar,
    answer_data, explanation_sv, explanation_en, explanation_ar,
    difficulty, status
  ),
  exercises (
    id, instruction_sv, instruction_en, instruction_ar,
    exercise_type, exercise_data, sort_order, status
  )
`;

const STATIC_VERB_PATHS = {
  A1: '/verbs-data.json',
  A2: '/verbs-a2-data.json',
  'B1-B2': '/verbs-b1b2-data.json',
};

let staticVocabCache = null;

function mapStaticVerb(v, level) {
  const en = v.english ?? v.en ?? '';
  const ar = v.arabic ?? v.ar ?? '';
  return {
    id: v.id,
    legacy_id: v.id,
    level,
    verb_group: v.group,
    imperative: v.imperative,
    infinitive: v.infinitive,
    present: v.present,
    preterite: v.preterite,
    supine: v.supine,
    content_en: en,
    content_ar: ar,
    english: en,
    arabic: ar,
    image_path: resolveMediaUrl(v.image?.replace('./', '/')),
    status: 'published',
    _source: 'static',
  };
}

function mapDbVerb(v) {
  const level = v.cefr_level === 'B1' || v.cefr_level === 'B2' ? 'B1-B2' : v.cefr_level;
  return {
    ...v,
    level,
    legacy_id: v.source_key?.split(':').pop() ?? v.id,
    verb_group: v.verb_group,
    group: v.verb_group,
    content_en: v.meaning_en,
    content_ar: v.meaning_ar,
    english: v.meaning_en,
    arabic: v.meaning_ar,
    image_path: resolveMediaUrl(v.image_path),
    _source: 'supabase',
  };
}

function mapVocabRow(v, index) {
  return {
    id: v.id ?? index + 1,
    slug: v.slug,
    sv: v.word_sv ?? v.sv,
    en: v.meaning_en ?? v.en ?? '',
    ar: v.meaning_ar ?? v.ar ?? '',
    word_class: v.word_class,
    cefr_level: v.cefr_level,
    category: v.category,
    image_path: resolveMediaUrl(v.image_path),
    _source: v._source ?? 'supabase',
  };
}

async function loadStaticVocabulary() {
  if (staticVocabCache) return staticVocabCache;
  const res = await fetch('/quizlet-vocabulary.json');
  if (!res.ok) throw new Error('Kunde inte läsa ordlistan.');
  staticVocabCache = (await res.json()).map((w, i) => mapVocabRow(w, i));
  staticVocabCache.forEach((w) => {
    w._source = 'static';
  });
  return staticVocabCache;
}

function filterVocabulary(items, { search, level, category }) {
  const q = search.trim().toLowerCase();
  return items.filter((w) => {
    if (level && w.cefr_level !== level) return false;
    if (category && w.category !== category) return false;
    if (!q) return true;
    return `${w.sv} ${w.en} ${w.ar}`.toLowerCase().includes(q);
  });
}

export async function fetchVerbs(level) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('verbs').select(VERB_SELECT).eq('status', 'published');
      if (level === 'B1-B2') {
        query = query.in('cefr_level', ['B1', 'B2']);
      } else {
        query = query.eq('cefr_level', level);
      }
      const { data, error } = await query.order('infinitive');
      if (!error && data?.length) {
        return { items: data.map(mapDbVerb), source: 'supabase' };
      }
    } catch {
      /* fall through to static */
    }
  }

  const path = STATIC_VERB_PATHS[level];
  if (!path) return { items: [], source: 'static' };

  const res = await fetch(path);
  if (!res.ok) throw new Error('Kunde inte läsa verbdata.');
  const json = await res.json();
  const verbs = Array.isArray(json) ? json : json.verbs ?? [];
  return { items: verbs.map((v) => mapStaticVerb(v, level)), source: 'static' };
}

export async function fetchAuxiliaries() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('verbs')
        .select(VERB_SELECT)
        .eq('cefr_level', 'A1')
        .eq('status', 'published')
        .in('infinitive', ['vara', 'ha', 'bli']);
      if (!error && data?.length) {
        return {
          items: data.map(mapDbVerb),
          source: 'supabase',
        };
      }
    } catch {
      /* fallback */
    }
  }

  const res = await fetch('/verbs-data.json');
  if (!res.ok) return { items: [], source: 'static' };
  const json = await res.json();
  return {
    items: (json.auxiliaries ?? []).map((a, i) => ({
      id: i + 1,
      content_sv: a.swedish,
      content_en: a.english,
      content_ar: a.arabic,
      swedish: a.swedish,
      english: a.english,
      arabic: a.arabic,
      _source: 'static',
    })),
    source: 'static',
  };
}

export async function fetchVocabularyPage({
  page = 1,
  pageSize = 50,
  search = '',
  level = '',
  category = '',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('vocabulary')
        .select(VOCAB_SELECT, { count: 'exact' })
        .eq('status', 'published');

      if (level) query = query.eq('cefr_level', level);
      if (category) query = query.eq('category', category);
      if (search.trim()) {
        const term = search.trim().replace(/[%_,().]/g, '');
        if (term) {
          query = query.or(`word_sv.ilike.%${term}%,meaning_en.ilike.%${term}%,meaning_ar.ilike.%${term}%`);
        }
      }

      const { data, error, count } = await query.order('word_sv').range(from, to);
      if (!error && data) {
        return {
          items: data.map((v, i) => mapVocabRow(v, from + i)),
          total: count ?? data.length,
          page,
          pageSize,
          source: 'supabase',
        };
      }
    } catch {
      /* fallback */
    }
  }

  const all = await loadStaticVocabulary();
  const filtered = filterVocabulary(all, { search, level, category });
  const slice = filtered.slice(from, to + 1);
  return {
    items: slice,
    total: filtered.length,
    page,
    pageSize,
    source: 'static',
  };
}

export async function fetchVocabularyCategories() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('category')
        .eq('status', 'published')
        .not('category', 'is', null);
      if (!error && data?.length) {
        return [...new Set(data.map((r) => r.category).filter(Boolean))].sort();
      }
    } catch {
      /* fallback */
    }
  }
  return ['general'];
}

async function loadStaticLessons(level) {
  if (level === 'A1') {
    const { lessonsA1 } = await import('@/data/lessons-a1.js');
    return lessonsA1.map((l) => normalizeLessonFromStatic(l, 'A1'));
  }
  const { lessonsB1 } = await import('@/data/lessons-b1.js');
  return lessonsB1.map((l) => normalizeLessonFromStatic(l, 'B1-B2'));
}

export async function fetchLessonsByLevel(level) {
  const cefrLevels = level === 'A1' ? ['A1'] : level === 'B1-B2' ? ['B1', 'B2'] : [level];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(LESSON_SELECT)
        .in('cefr_level', cefrLevels)
        .eq('status', 'published')
        .order('sort_order');

      if (!error && data?.length) {
        return {
          items: data.map(normalizeLessonFromDb),
          source: 'supabase',
        };
      }
    } catch {
      /* fallback */
    }
  }

  return {
    items: await loadStaticLessons(level),
    source: 'static',
  };
}

export async function fetchLessonBySlug(slug) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(LESSON_SELECT)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (!error && data) {
        return { item: normalizeLessonFromDb(data), source: 'supabase' };
      }
    } catch {
      /* fallback */
    }
  }

  const { lessonsA1 } = await import('@/data/lessons-a1.js');
  const { lessonsB1 } = await import('@/data/lessons-b1.js');
  const all = [
    ...lessonsA1.map((l) => normalizeLessonFromStatic(l, 'A1')),
    ...lessonsB1.map((l) => normalizeLessonFromStatic(l, 'B1-B2')),
  ];
  const found = all.find((l) => l.slug === slug);
  return found ? { item: found, source: 'static' } : { item: null, source: 'static' };
}

/** Published lesson slugs for sitemap generation */
export async function fetchPublishedLessonSlugs() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('slug, cefr_level, updated_at')
        .eq('status', 'published')
        .order('sort_order');
      if (!error && data?.length) return data;
    } catch {
      /* fallback */
    }
  }

  const { lessonsA1 } = await import('@/data/lessons-a1.js');
  const { lessonsB1 } = await import('@/data/lessons-b1.js');
  return [
    ...lessonsA1.map((l, i) => ({
      slug: `a1-${String(l.number).padStart(2, '0')}-${l.title_sv.toLowerCase().replace(/\s+/g, '-').slice(0, 40)}`,
      cefr_level: 'A1',
      updated_at: null,
    })),
    ...lessonsB1.map((l) => ({
      slug: `b2-${String(l.number).padStart(2, '0')}-${l.title_sv.toLowerCase().replace(/\s+/g, '-').slice(0, 40)}`,
      cefr_level: 'B2',
      updated_at: null,
    })),
  ];
}
