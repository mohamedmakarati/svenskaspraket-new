import { supabase } from './supabase';
import { randomStorageName } from './slug';
import { validateUpload } from './utils';

function requireClient() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

const SEARCH_COLS = {
  verbs: 'infinitive,meaning_en,meaning_ar,slug',
  vocabulary: 'word_sv,meaning_en,meaning_ar,slug',
  lessons: 'title_sv,title_en,slug',
  quiz_questions: 'question_sv,question_en',
};

export async function adminList(table, {
  page = 1,
  pageSize = 20,
  search = '',
  filters = {},
  sort = 'updated_at',
  ascending = false,
} = {}) {
  const sb = requireClient();
  let query = sb.from(table).select('*', { count: 'exact' });

  Object.entries(filters).forEach(([key, val]) => {
    if (val !== '' && val != null) query = query.eq(key, val);
  });

  if (search && SEARCH_COLS[table]) {
    const or = SEARCH_COLS[table]
      .split(',')
      .map((f) => `${f}.ilike.%${search.replace(/%/g, '')}%`)
      .join(',');
    query = query.or(or);
  }

  const from = (page - 1) * pageSize;
  query = query.order(sort, { ascending }).range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function adminGetById(table, id) {
  const sb = requireClient();
  const { data, error } = await sb.from(table).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function adminCreate(table, record) {
  const sb = requireClient();
  const { data, error } = await sb.from(table).insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function adminUpdate(table, id, record) {
  const sb = requireClient();
  const { data, error } = await sb.from(table).update(record).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function adminDelete(table, id) {
  const sb = requireClient();
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function adminDashboardStats() {
  const sb = requireClient();
  const tables = ['verbs', 'vocabulary', 'lessons', 'quiz_questions'];
  const stats = {};

  for (const t of tables) {
    const { count: total } = await sb.from(t).select('*', { count: 'exact', head: true });
    const { count: published } = await sb
      .from(t)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');
    const { count: draft } = await sb
      .from(t)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');
    stats[t] = { total: total ?? 0, published: published ?? 0, draft: draft ?? 0 };
  }
  return stats;
}

export async function adminRecentContent(limit = 8) {
  const sb = requireClient();
  const queries = [
    sb.from('verbs').select('id,infinitive,status,updated_at').order('updated_at', { ascending: false }).limit(limit),
    sb.from('vocabulary').select('id,word_sv,status,updated_at').order('updated_at', { ascending: false }).limit(limit),
    sb.from('lessons').select('id,title_sv,status,updated_at').order('updated_at', { ascending: false }).limit(limit),
  ];
  const results = await Promise.all(queries);
  const items = [];
  results.forEach((r, i) => {
    const type = ['verb', 'vocabulary', 'lesson'][i];
    (r.data ?? []).forEach((row) => {
      items.push({
        type,
        id: row.id,
        label: row.infinitive ?? row.word_sv ?? row.title_sv,
        status: row.status,
        updated_at: row.updated_at,
      });
    });
  });
  return items.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, limit);
}

export async function adminContentWarnings() {
  const sb = requireClient();
  const missingTranslations = [];
  const missingImages = [];

  const { data: verbs } = await sb.from('verbs').select('id,infinitive,meaning_en,meaning_ar,image_path,status').neq('status', 'archived');
  (verbs ?? []).forEach((v) => {
    if (!v.meaning_en || !v.meaning_ar) {
      missingTranslations.push({ type: 'verb', id: v.id, label: v.infinitive });
    }
    if (!v.image_path) missingImages.push({ type: 'verb', id: v.id, label: v.infinitive });
  });

  const { data: vocab } = await sb.from('vocabulary').select('id,word_sv,meaning_en,meaning_ar,image_path,status').neq('status', 'archived');
  (vocab ?? []).forEach((v) => {
    if (!v.meaning_en || !v.meaning_ar) {
      missingTranslations.push({ type: 'vocabulary', id: v.id, label: v.word_sv });
    }
    if (!v.image_path) missingImages.push({ type: 'vocabulary', id: v.id, label: v.word_sv });
  });

  const { data: lessons } = await sb.from('lessons').select('id,title_sv,title_en,title_ar,featured_image_path,status').neq('status', 'archived');
  (lessons ?? []).forEach((l) => {
    if (!l.title_en || !l.title_ar) {
      missingTranslations.push({ type: 'lesson', id: l.id, label: l.title_sv });
    }
    if (!l.featured_image_path) missingImages.push({ type: 'lesson', id: l.id, label: l.title_sv });
  });

  return { missingTranslations: missingTranslations.slice(0, 20), missingImages: missingImages.slice(0, 20) };
}

export async function adminListExercises(lessonId) {
  const sb = requireClient();
  const { data, error } = await sb
    .from('exercises')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function adminListQuizByLesson(lessonId) {
  const sb = requireClient();
  const { data, error } = await sb
    .from('quiz_questions')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertExercise(record) {
  if (record.id) {
    const { id, ...rest } = record;
    return adminUpdate('exercises', id, rest);
  }
  return adminCreate('exercises', record);
}

export async function adminDeleteExercise(id) {
  return adminDelete('exercises', id);
}

const ENTITY_SEARCH = {
  lessons: { label: 'title_sv', cols: 'title_sv,slug' },
  verbs: { label: 'infinitive', cols: 'infinitive,slug' },
  vocabulary: { label: 'word_sv', cols: 'word_sv,slug' },
};

/** Lightweight option list for admin entity pickers */
export async function adminSearchEntities(table, query = '', limit = 25) {
  const meta = ENTITY_SEARCH[table];
  if (!meta) throw new Error(`Unknown entity table: ${table}`);

  const sb = requireClient();
  let q = sb.from(table).select(`id,${meta.label},slug,status`).order(meta.label).limit(limit);

  const term = query.trim();
  if (term) {
    const or = meta.cols
      .split(',')
      .map((f) => `${f}.ilike.%${term.replace(/%/g, '')}%`)
      .join(',');
    q = q.or(or);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    label: row[meta.label] ?? row.slug ?? row.id,
    status: row.status,
  }));
}

export async function adminListMedia() {
  const sb = requireClient();
  const { data, error } = await sb.from('media').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateMedia(id, updates) {
  return adminUpdate('media', id, updates);
}

export async function adminDeleteMedia(id) {
  const sb = requireClient();
  const row = await adminGetById('media', id);
  if (row.storage_path) {
    const { error: storageError } = await sb.storage.from('media').remove([row.storage_path]);
    if (storageError) throw storageError;
  }
  await adminDelete('media', id);
}

export async function adminUploadMedia(file, alt = {}) {
  const validation = validateUpload(file);
  if (validation) throw new Error(validation);

  const sb = requireClient();
  const storagePath = `uploads/${randomStorageName(file.name)}`;
  const { error: uploadError } = await sb.storage.from('media').upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (uploadError) throw uploadError;

  const { data: urlData } = sb.storage.from('media').getPublicUrl(storagePath);
  const { data, error } = await sb
    .from('media')
    .insert({
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      alt_text_sv: alt.sv ?? null,
      alt_text_en: alt.en ?? null,
      alt_text_ar: alt.ar ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, public_url: urlData.publicUrl };
}

export async function adminListSettings() {
  const sb = requireClient();
  const { data, error } = await sb.from('site_settings').select('*').order('setting_key');
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertSetting(key, value) {
  const sb = requireClient();
  const { data, error } = await sb
    .from('site_settings')
    .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminListUsers() {
  const sb = requireClient();
  const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateProfile(id, updates) {
  const sb = requireClient();
  const { data, error } = await sb.from('profiles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export function getMediaPublicUrl(storagePath) {
  if (!supabase || !storagePath) return null;
  return supabase.storage.from('media').getPublicUrl(storagePath).data.publicUrl;
}
