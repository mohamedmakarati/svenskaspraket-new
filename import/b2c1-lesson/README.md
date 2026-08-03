# Rivstart B2/C1 lesson pack

Interactive trilingual lesson (SV / EN / AR) with flashcards, quiz and searchable table.

## Current sets (151 entries)

| Set | Quizlet | Entries |
|-----|---------|---------|
| Så funkar ett språkgeni – Kapitel 1 | `_8nlhmv` | 61 |
| Verb – Kapitel 1–3 | `_8n36aw` | 62 |
| Ord, ord, ord – Kapitel 1 | `_8n3678` | 28 |

Duplicates (e.g. *uppskattar*, *förknippar*, *uppger*) are kept when they appear in multiple source sets.

## Add more PDFs (repeatable workflow)

1. Export Quizlet set as PDF.
2. Drop file in **`incoming/`** or `Desktop/svenska/`.
3. Run from repo root:

```bash
npm run import:b2c1-pdfs
```

4. Preview at `/lessons-b2c1` (`npm run dev`).

The script parses SV+EN, merges into `lesson-data.js`, preserves existing Arabic, syncs `src/data/lesson-b2c1.js`, and archives PDFs to `archive/`.

## Credit

Quizlet sets by **AnnaRansheim**. Independent study adaptation — not official Quizlet, Rivstart or publisher material.

## Publishing

Page uses **`noindex`** until licensing is confirmed. See `src/lib/seo.js` → `lessonB2C1`.
