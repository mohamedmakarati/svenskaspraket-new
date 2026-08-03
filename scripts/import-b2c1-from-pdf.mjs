#!/usr/bin/env node
/**
 * Import Quizlet PDF exports into import/b2c1-lesson/lesson-data.js
 *
 * Drop PDFs in import/b2c1-lesson/incoming/ then run:
 *   npm run import:b2c1-pdfs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import pdf from 'pdf-parse';
import { parseQuizletPdfText, slugifySetId } from './parse-quizlet-pdf.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PACK = resolve(ROOT, 'import/b2c1-lesson');
const INCOMING = resolve(PACK, 'incoming');
const ARCHIVE = resolve(PACK, 'archive');
const LESSON_DATA = resolve(PACK, 'lesson-data.js');
const LOG_FILE = resolve(PACK, 'import-log.json');

const META = {
  title: 'Rivstart B2/C1 - Kapitel 1-3: ord och verb',
  creatorCredit: 'Quizlet-set skapade av AnnaRansheim',
  disclaimer:
    'En oberoende studieanpassning. Inte officiellt material från Quizlet, Rivstart eller förlaget.',
};

const EXTRA_SCAN_DIRS = [
  INCOMING,
  resolve(ROOT, '..'), // Desktop/svenska — user drop folder
];

function loadExistingLesson() {
  if (!existsSync(LESSON_DATA)) {
    return { ...META, sets: [] };
  }
  const src = readFileSync(LESSON_DATA, 'utf8');
  const match = src.match(/window\.LESSON_DATA\s*=\s*(\{[\s\S]*\});/);
  if (!match) throw new Error('Could not parse lesson-data.js');
  return eval(`(${match[1]})`);
}

function flattenArMap(lesson) {
  const map = new Map();
  for (const set of lesson.sets ?? []) {
    for (const row of set.entries ?? []) {
      const [n, sv, en, ar] = row;
      if (ar) map.set(`${sv.toLowerCase()}|${en.toLowerCase()}`, ar);
      if (ar) map.set(sv.toLowerCase(), ar);
    }
  }
  return map;
}

function lookupAr(sv, en, arMap) {
  return (
    arMap.get(`${sv.toLowerCase()}|${en.toLowerCase()}`) ??
    arMap.get(sv.toLowerCase()) ??
    ''
  );
}

function entriesToRows(entries, arMap) {
  return entries.map(({ n, sv, en }) => [n, sv, en, lookupAr(sv, en, arMap)]);
}

function writeLessonData(lesson) {
  const body = `window.LESSON_DATA = ${JSON.stringify(lesson, null, 2)};\n`;
  writeFileSync(LESSON_DATA, body);
}

function loadLog() {
  if (!existsSync(LOG_FILE)) return { imported: {} };
  return JSON.parse(readFileSync(LOG_FILE, 'utf8'));
}

function saveLog(log) {
  writeFileSync(LOG_FILE, `${JSON.stringify(log, null, 2)}\n`);
}

function fileHash(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 16);
}

async function extractPdfText(path) {
  const buffer = readFileSync(path);
  const data = await pdf(buffer);
  return data.text;
}

function collectPdfPaths() {
  const seen = new Set();
  const paths = [];
  for (const dir of EXTRA_SCAN_DIRS) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.toLowerCase().endsWith('.pdf')) continue;
      if (name.toLowerCase().includes('copy.pdf')) continue;
      const full = resolve(dir, name);
      if (seen.has(full)) continue;
      seen.add(full);
      paths.push(full);
    }
  }
  return paths.sort();
}

async function main() {
  mkdirSync(INCOMING, { recursive: true });
  mkdirSync(ARCHIVE, { recursive: true });

  const lesson = loadExistingLesson();
  const arMap = flattenArMap(lesson);
  const log = loadLog();
  const pdfs = collectPdfPaths();

  if (!pdfs.length) {
    console.log('No PDF files found. Drop Quizlet exports in:');
    console.log(`  ${INCOMING}`);
    return;
  }

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const pdfPath of pdfs) {
    const hash = fileHash(pdfPath);
    const name = basename(pdfPath);

    if (log.imported[name]?.hash === hash) {
      console.log(`↷ Skip (unchanged): ${name}`);
      skipped++;
      continue;
    }

    const text = await extractPdfText(pdfPath);
    const parsed = parseQuizletPdfText(text);

    if (!parsed.sourceUrl || parsed.entries.length === 0) {
      console.warn(`✗ Could not parse Quizlet format: ${name}`);
      continue;
    }

    const setId = slugifySetId(parsed.title, parsed.sourceUrl);
    const setPayload = {
      id: setId,
      title: parsed.title.replace(/\s*\(Rivstart[^)]*\)\s*/i, '').trim() || parsed.title,
      sourceUrl: parsed.sourceUrl,
      entries: entriesToRows(parsed.entries, arMap),
    };

    const idx = lesson.sets.findIndex((s) => s.sourceUrl === parsed.sourceUrl || s.id === setId);
    if (idx >= 0) {
      lesson.sets[idx] = setPayload;
      updated++;
      console.log(`↻ Updated set "${setPayload.title}" — ${setPayload.entries.length} entries (${name})`);
    } else {
      lesson.sets.push(setPayload);
      added++;
      console.log(`+ Added set "${setPayload.title}" — ${setPayload.entries.length} entries (${name})`);
    }

    const missingAr = setPayload.entries.filter((row) => !row[3]).length;
    if (missingAr) {
      console.log(`  ⚠ ${missingAr} entries need Arabic translation (showing English fallback on site)`);
    }

    log.imported[name] = { hash, sourceUrl: parsed.sourceUrl, setId, at: new Date().toISOString() };
    copyFileSync(pdfPath, join(ARCHIVE, name));
  }

  writeLessonData(lesson);
  saveLog(log);

  const total = lesson.sets.reduce((n, s) => n + s.entries.length, 0);
  console.log(`\n✓ lesson-data.js — ${lesson.sets.length} sets, ${total} source entries`);
  console.log(`  Added: ${added}, Updated: ${updated}, Skipped: ${skipped}`);
  console.log('  Run: npm run sync:b2c1');
}

main().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
