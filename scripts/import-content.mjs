#!/usr/bin/env node
/**
 * SvenskaSpråket content import CLI
 *
 * Usage:
 *   npm run import:validate   — validate sources, write report (no DB)
 *   npm run import:dry-run    — validate + simulate DB upserts (no writes)
 *   npm run import:content    — validate + import (requires approval env vars)
 *
 * Credentials: local .env only (SUPABASE_SERVICE_ROLE_KEY never in browser code)
 */
import { loadAllSources } from './import/load-sources.mjs';
import { validateDataset, verifyUnicodeSamples } from './import/validate.mjs';
import { writeReport } from './import/report.mjs';
import { getSupabaseConfig, assertImportAllowed } from './import/env.mjs';
import { createServiceClient, runImport } from './import/db.mjs';

const mode = process.argv[2] ?? 'validate';

async function main() {
  console.log('Loading source files (read-only)…');
  const data = await loadAllSources();
  console.log(`  Verbs: ${data.meta.counts.verbs}, Vocabulary: ${data.meta.counts.vocabulary}, Lessons: ${data.meta.counts.lessons}, Quizzes: ${data.meta.counts.quizzes}`);

  const report = validateDataset(data);
  report.mode = mode;
  report.unicodeSamples = verifyUnicodeSamples(data);

  const quizRecords = data.quizzes.map((q) => ({
    ...q,
    lesson_source_key: q.lesson_source_key,
  }));

  if (mode === 'validate') {
    const paths = writeReport(report, 'validate');
    console.log('\nValidation complete (no database changes).');
    console.log(`  Valid verbs: ${report.summary.validVerbs}`);
    console.log(`  Valid vocabulary: ${report.summary.validVocabulary}`);
    console.log(`  Valid lessons: ${report.summary.validLessons}`);
    console.log(`  Valid quizzes: ${report.summary.validQuizzes}`);
    console.log(`  Warnings — missing translations: ${report.missingTranslations.length}`);
    console.log(`  Warnings — invalid verb forms: ${report.invalidVerbForms.length}`);
    console.log(`  Warnings — missing images: ${report.missingImages.length}`);
    console.log(`  Duplicates: ${report.duplicates.length}`);
    console.log(`\nReport: ${paths.mdPath}`);
    return;
  }

  if (mode === 'dry-run') {
    const { url, key } = getSupabaseConfig({ requireServiceRole: true });
    const supabase = createServiceClient(url, key);
    report.summary.imported = 0;
    report.summary.updated = 0;
    await runImport(supabase, report, quizRecords, { dryRun: true });
    const paths = writeReport(report, 'dry-run');
    console.log('\nDry run complete (no database changes).');
    console.log(`  Would import: ${report.summary.imported}`);
    console.log(`  Would update: ${report.summary.updated}`);
    console.log(`  Would upload images: ${report.summary.imagesUploaded}`);
    console.log(`\nReport: ${paths.mdPath}`);
    return;
  }

  if (mode === 'import') {
    assertImportAllowed({ dryRun: false, validateOnly: false });
    const { url, key } = getSupabaseConfig({ requireServiceRole: true });
    const supabase = createServiceClient(url, key);

    console.log('\n⚠️  Writing to Supabase. Ensure migration 006 (source_key) is applied.');
    console.log('    Set IMPORT_ENV=staging or IMPORT_ALLOW_PRODUCTION=yes for production.\n');

    report.summary.imported = 0;
    report.summary.updated = 0;
    await runImport(supabase, report, quizRecords, { dryRun: false });
    const paths = writeReport(report, 'import');
    console.log('\nImport complete.');
    console.log(`  Imported: ${report.summary.imported}`);
    console.log(`  Updated: ${report.summary.updated}`);
    console.log(`  Images uploaded: ${report.summary.imagesUploaded}`);
    console.log(`  Skipped: ${report.summary.skipped}`);
    console.log(`\nReport: ${paths.mdPath}`);
    return;
  }

  console.error(`Unknown mode: ${mode}. Use validate, dry-run, or import.`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
