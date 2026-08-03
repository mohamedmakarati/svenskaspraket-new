import { supabase, isSupabaseConfigured } from './supabase';

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
    content_sv: v.infinitive,
    content_en: en,
    content_ar: ar,
    image_path: v.image?.replace('./', '/'),
    is_auxiliary: false,
    status: 'published',
  };
}

const STATIC_PATHS = {
  A1: '/verbs-data.json',
  A2: '/verbs-a2-data.json',
  'B1-B2': '/verbs-b1b2-data.json',
};

export async function fetchVerbs(level) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('verbs')
      .select('*')
      .eq('level', level)
      .eq('status', 'published')
      .eq('is_auxiliary', false)
      .order('legacy_id');
    if (!error && data?.length) return data;
  }

  const path = STATIC_PATHS[level];
  if (!path) return [];

  const res = await fetch(path);
  if (!res.ok) throw new Error('Kunde inte läsa verbdata.');
  const json = await res.json();
  const verbs = Array.isArray(json) ? json : json.verbs ?? [];
  return verbs.map((v) => mapStaticVerb(v, level));
}

export async function fetchAuxiliaries() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('verbs')
      .select('*')
      .eq('level', 'A1')
      .eq('is_auxiliary', true)
      .eq('status', 'published');
    if (!error && data?.length) return data;
  }

  const res = await fetch('/verbs-data.json');
  if (!res.ok) return [];
  const json = await res.json();
  return (json.auxiliaries ?? []).map((a, i) => ({
    id: i + 1,
    content_sv: a.swedish,
    content_en: a.english,
    content_ar: a.arabic,
    swedish: a.swedish,
    english: a.english,
    arabic: a.arabic,
  }));
}

export async function fetchVocabulary() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('status', 'published')
      .order('legacy_id');
    if (!error && data?.length) {
      return data.map((v) => ({
        id: v.legacy_id ?? v.id,
        sv: v.content_sv,
        en: v.content_en,
        ar: v.content_ar,
      }));
    }
  }

  const res = await fetch('/quizlet-vocabulary.json');
  if (!res.ok) throw new Error('Kunde inte läsa ordlistan.');
  return res.json();
}

export async function fetchLessons(level) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, quiz_questions(*)')
      .eq('level', level)
      .eq('status', 'published')
      .order('lesson_number');
    if (!error && data?.length) return data;
  }
  return null;
}

export async function fetchQuizQuestions(lessonId) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('status', 'published')
      .order('order_index');
    if (!error && data?.length) return data;
  }
  return null;
}

// Admin data access
export async function adminFetchAll(table, { page = 1, pageSize = 20, search = '', filters = {} } = {}) {
  if (!supabase) throw new Error('Supabase not configured');

  let query = supabase.from(table).select('*', { count: 'exact' });

  Object.entries(filters).forEach(([key, val]) => {
    if (val !== '' && val != null) query = query.eq(key, val);
  });

  if (search) {
    const cols = {
      verbs: 'infinitive,content_en,content_ar',
      vocabulary: 'content_sv,content_en,content_ar',
      lessons: 'title_sv,title_en,slug',
      quiz_questions: 'question_sv,correct_answer',
    };
    const fields = cols[table] ?? 'content_sv';
    query = query.or(fields.split(',').map((f) => `${f}.ilike.%${search}%`).join(','));
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1).order('updated_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function adminUpsert(table, record) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from(table).upsert(record).select().single();
  if (error) throw error;
  return data;
}

export async function adminDelete(table, id) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function adminStats() {
  if (!supabase) throw new Error('Supabase not configured');
  const tables = ['verbs', 'vocabulary', 'lessons', 'quiz_questions', 'media'];
  const stats = {};
  for (const t of tables) {
    const { count: total } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (t === 'media') {
      stats[t] = { total: total ?? 0, published: total ?? 0, draft: 0 };
    } else {
      const { count: published } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      stats[t] = { total: total ?? 0, published: published ?? 0, draft: (total ?? 0) - (published ?? 0) };
    }
  }
  return stats;
}

export async function uploadMedia(file) {
  if (!supabase) throw new Error('Supabase not configured');
  const path = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
  const { data, error } = await supabase
    .from('media')
    .insert({
      filename: file.name,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, public_url: urlData.publicUrl };
}
