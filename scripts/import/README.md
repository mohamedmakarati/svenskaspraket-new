# Content Import — SvenskaSpråket

Safe, repeatable import of educational content from local JSON/JS files into Supabase.

**Source files are never modified.** All imports run from local Node.js scripts using the service-role key in `.env` (never in browser code).

## Prerequisites

1. Apply Supabase migrations `001`–`006` (especially `006_import_source_keys.sql` for idempotent upserts).
2. Create `.env` from `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   IMPORT_ENV=staging
   ```
3. Ensure the `media` storage bucket exists (migration `005`).

## Commands

| Command | Description |
|---------|-------------|
| `npm run import:validate` | Load & validate all sources, write report — **no DB changes** |
| `npm run import:dry-run` | Validate + simulate upserts & image uploads — **no DB changes** |
| `npm run import:content` | Validate + write to Supabase (blocked on production without explicit approval) |

## Import order

1. Lessons (stable `source_key` e.g. `lesson:a1:01`)
2. Quiz questions (linked by `lesson_source_key`)
3. Verb images → Supabase Storage (`media` bucket)
4. Verbs (with storage URLs where uploaded)
5. Vocabulary

## Stable identifiers

| Content | source_key example |
|---------|-------------------|
| A1 verb #1 | `verb:a1:001` |
| A1 auxiliary #1 | `verb:a1:aux:001` |
| A2 verb #42 | `verb:a2:042` |
| B2 verb #1 | `verb:b2:001` |
| Vocabulary #805 | `vocab:0805` |
| A1 lesson | `lesson:a1:01` |
| B2 lesson #3 | `lesson:b2:03` |
| Quiz | `quiz:lesson:a1:01:001` |

Upserts use `ON CONFLICT (source_key)` — safe to re-run without duplicates.

## Source files (read-only)

| File | Content |
|------|---------|
| `public/verbs-data.json` | 131 A1 verbs + 9 auxiliaries |
| `public/verbs-a2-data.json` | 199 A2 verbs |
| `public/verbs-b1b2-data.json` | 135 B2 verbs |
| `public/quizlet-vocabulary.json` | 805 vocabulary entries |
| `src/data/lessons-a1.js` | 1 A1 grammar lesson + quizzes |
| `src/data/lessons-b1.js` | 4 B2 grammar lessons + quizzes |
| `public/verb-images/**` | 465 SVG illustrations |

## Validation report

Reports are written to `reports/` (gitignored): imported, updated, skipped, duplicates, missing translations, invalid verb forms, missing images.

## Production import guard

```env
IMPORT_ENV=production
IMPORT_ALLOW_PRODUCTION=yes
```

Both required for production writes via `npm run import:content`.

## Backup & recovery

**Before import:**
```bash
supabase db dump --linked -f backup-before-import.sql
```

**Restore:** Supabase Dashboard → Database → Backups, or run backup SQL in SQL Editor.

**Partial rollback:**
```sql
DELETE FROM quiz_questions WHERE source_key LIKE 'quiz:%';
DELETE FROM lessons WHERE source_key LIKE 'lesson:%';
DELETE FROM verbs WHERE source_key LIKE 'verb:%';
DELETE FROM vocabulary WHERE source_key LIKE 'vocab:%';
```

## Typical workflow

```bash
npm run import:validate          # review reports/validate-*.md
npm run import:dry-run             # simulate against staging
IMPORT_ENV=staging npm run import:content   # after approval
```
