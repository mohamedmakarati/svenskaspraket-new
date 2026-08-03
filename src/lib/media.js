import { supabase } from './supabase';

/** Resolve a stored path or URL to a public image URL. */
export function resolveMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\.\//, '/');
  if (normalized.startsWith('/')) return normalized;
  if (supabase) {
    const { data } = supabase.storage.from('media').getPublicUrl(normalized);
    return data?.publicUrl ?? normalized;
  }
  return normalized;
}

export function verbImageAlt(verb, lang = 'sv') {
  const inf = verb.infinitive ?? verb.content_sv ?? '';
  if (lang === 'ar') return `صورة توضيحية للفعل السويدي «${inf}»`;
  if (lang === 'en') return `Illustration for the Swedish verb “${inf}”`;
  return `Minnesbild för verbet ${inf}`;
}

export function vocabImageAlt(word, lang = 'sv') {
  const sv = word.sv ?? word.word_sv ?? '';
  if (lang === 'ar') return `صورة توضيحية للكلمة السويدية «${sv}»`;
  if (lang === 'en') return `Illustration for the Swedish word “${sv}”`;
  return `Minnesbild för ordet ${sv}`;
}
