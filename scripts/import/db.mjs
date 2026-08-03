/**
 * Supabase upsert operations (service role — server-side only).
 */
import { createClient } from '@supabase/supabase-js';

export function createServiceClient(url, serviceKey) {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function fetchExistingBySourceKeys(supabase, table, keys) {
  if (!keys.length) return new Map();
  const { data, error } = await supabase.from(table).select('id, source_key, slug, updated_at').in('source_key', keys);
  if (error) throw error;
  return new Map((data ?? []).map((r) => [r.source_key, r]));
}

export async function upsertBatch(supabase, table, rows, report, { dryRun = false } = {}) {
  if (!rows.length) return new Map();

  const keys = rows.map((r) => r.source_key);
  const existing = dryRun ? new Map() : await fetchExistingBySourceKeys(supabase, table, keys);

  for (const row of rows) {
    const prev = existing.get(row.source_key);
    if (prev) {
      report.updated.push({ source_key: row.source_key, slug: row.slug, action: `update ${table}` });
      report.summary.updated++;
    } else {
      report.imported.push({ source_key: row.source_key, slug: row.slug, action: `insert ${table}` });
      report.summary.imported++;
    }
  }

  if (dryRun) {
    return new Map(rows.map((r) => [r.source_key, { id: `dry-run-${r.source_key}`, source_key: r.source_key }]));
  }

  const { data, error } = await supabase.from(table).upsert(rows, { onConflict: 'source_key' }).select('id, source_key');
  if (error) throw error;

  return new Map((data ?? []).map((r) => [r.source_key, r]));
}

export async function upsertQuizzes(supabase, quizzes, lessonIdBySourceKey, report, { dryRun = false } = {}) {
  const rows = [];
  for (const q of quizzes) {
    const lessonId = lessonIdBySourceKey.get(q.lesson_source_key)?.id ?? null;
    if (!lessonId && !dryRun) {
      report.skipped.push({ source_key: q.source_key, message: `Lesson not found: ${q.lesson_source_key}` });
      report.summary.skipped++;
      continue;
    }
    const { lesson_source_key, kind, _source, ...rest } = q;
    rows.push({ ...rest, lesson_id: lessonId });
  }

  return upsertBatch(supabase, 'quiz_questions', rows, report, { dryRun });
}

export async function runImport(supabase, report, quizRecords, { dryRun = false } = {}) {
  const { valid } = report;

  const lessonMap = await upsertBatch(supabase, 'lessons', valid.lessons, report, { dryRun });

  await upsertQuizzes(supabase, quizRecords, lessonMap, report, { dryRun });

  let verbs = [...valid.verbs];
  if (verbs.some((v) => v.image_path)) {
    const { uploadVerbImages, applyImageUrls } = await import('./images.mjs');
    const urlMap = await uploadVerbImages(supabase, verbs, report, { dryRun });
    verbs = applyImageUrls(verbs, urlMap);
  }

  await upsertBatch(supabase, 'verbs', verbs, report, { dryRun });
  await upsertBatch(supabase, 'vocabulary', valid.vocabulary, report, { dryRun });
}
