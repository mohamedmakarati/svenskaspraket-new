/**
 * Write validation / import reports to reports/ directory.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './env.mjs';

const REPORTS_DIR = resolve(ROOT, 'reports');

export function writeReport(report, label = 'import') {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const base = `${label}-${ts}`;

  const jsonPath = resolve(REPORTS_DIR, `${base}.json`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const mdPath = resolve(REPORTS_DIR, `${base}.md`);
  writeFileSync(mdPath, formatMarkdown(report), 'utf8');

  return { jsonPath, mdPath };
}

function formatMarkdown(report) {
  const s = report.summary;
  const lines = [
    '# SvenskaSpråket Import Report',
    '',
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode ?? 'validate'}`,
    '',
    '## Summary',
    '',
    '| Metric | Count |',
    '|--------|------:|',
    `| Verbs (source) | ${s.verbs ?? 0} |`,
    `| Vocabulary (source) | ${s.vocabulary ?? 0} |`,
    `| Lessons (source) | ${s.lessons ?? 0} |`,
    `| Quizzes (source) | ${s.quizzes ?? 0} |`,
    `| Valid verbs | ${s.validVerbs ?? 0} |`,
    `| Valid vocabulary | ${s.validVocabulary ?? 0} |`,
    `| Valid lessons | ${s.validLessons ?? 0} |`,
    `| Valid quizzes | ${s.validQuizzes ?? 0} |`,
    `| Imported (new) | ${s.imported ?? 0} |`,
    `| Updated (existing) | ${s.updated ?? 0} |`,
    `| Skipped | ${s.skipped ?? 0} |`,
    `| Images uploaded | ${s.imagesUploaded ?? 0} |`,
    `| Images skipped | ${s.imagesSkipped ?? 0} |`,
    '',
  ];

  const sections = [
    ['Imported records', report.imported],
    ['Updated records', report.updated],
    ['Skipped records', report.skipped],
    ['Duplicate records', report.duplicates],
    ['Missing translations', report.missingTranslations],
    ['Invalid verb forms', report.invalidVerbForms],
    ['Missing images', report.missingImages],
  ];

  for (const [title, items] of sections) {
    if (!items?.length) continue;
    lines.push(`## ${title} (${items.length})`, '');
    for (const item of items.slice(0, 50)) {
      lines.push(`- **${item.source_key ?? item.slug}**: ${item.message ?? item.action ?? ''}`);
    }
    if (items.length > 50) lines.push(`- … and ${items.length - 50} more`, '');
    lines.push('');
  }

  if (report.unicodeSamples?.length) {
    lines.push('## Unicode preservation samples', '');
    for (const u of report.unicodeSamples) {
      lines.push(`- ${u.field}: \`${u.value}\`${u.slug ? ` → slug \`${u.slug}\`` : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
