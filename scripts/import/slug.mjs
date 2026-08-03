/** Slug helpers for import scripts (UTF-8 safe — preserves åäö in source text, ASCII in slug). */

export function slugify(text) {
  if (!text) return 'item';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

export function verbSourceKey(level, id, suffix = '') {
  const lv = level.toLowerCase();
  const pad = String(id).padStart(3, '0');
  return suffix ? `verb:${lv}:${suffix}:${pad}` : `verb:${lv}:${pad}`;
}

export function verbSlug(level, id, infinitive) {
  return `verb-${level.toLowerCase()}-${String(id).padStart(3, '0')}-${slugify(infinitive)}`;
}

export function vocabSourceKey(id) {
  return `vocab:${String(id).padStart(4, '0')}`;
}

export function vocabSlug(id, wordSv) {
  return `vocab-${String(id).padStart(4, '0')}-${slugify(wordSv)}`;
}

export function lessonSourceKey(level, number) {
  return `lesson:${level.toLowerCase()}:${String(number).padStart(2, '0')}`;
}

export function lessonSlug(level, number, titleSv) {
  return `lesson-${level.toLowerCase()}-${String(number).padStart(2, '0')}-${slugify(titleSv)}`;
}

export function quizSourceKey(lessonKey, index) {
  return `quiz:${lessonKey}:${String(index).padStart(3, '0')}`;
}

export function normalizeImagePath(image) {
  if (!image) return null;
  return image.replace(/^\.\//, '/').replace(/\\/g, '/');
}

export function localImagePath(publicPath) {
  if (!publicPath) return null;
  return publicPath.replace(/^\//, '');
}
