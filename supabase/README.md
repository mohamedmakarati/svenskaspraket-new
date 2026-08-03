# SvenskaSpråket — Supabase Database

Versioned SQL migrations for PostgreSQL, Auth, Row Level Security and Storage.

## Migration files

| File | Purpose |
|------|---------|
| `001_extensions_and_helpers.sql` | Extensions, `updated_at` trigger, role helpers, slug/MIME validators |
| `002_core_tables.sql` | All 8 tables, indexes, unique constraints |
| `003_auth_and_audit.sql` | Profile auto-create, role protection, audit stamps |
| `004_rls_policies.sql` | Row Level Security for every table |
| `005_storage_policies.sql` | `media` bucket (5 MB, SVG/PNG/JPEG/WebP) |
| `006_import_source_keys.sql` | `source_key` columns + unique indexes for idempotent content import |

## Content import

After migrations `001`–`006` are applied, import educational data from local JSON/JS files:

```bash
npm run import:validate    # validate only — no DB changes
npm run import:dry-run     # simulate upserts against staging
npm run import:content     # write to Supabase (requires IMPORT_ENV guard)
```

See [scripts/import/README.md](../scripts/import/README.md) for backup/recovery, production guards, and stable `source_key` identifiers.

**Do not run `import:content` on production without explicit approval and a database backup.**

```
auth.users
    └── profiles (admin | editor | viewer)

verbs ─────────────┐
vocabulary ────────┼── quiz_questions
lessons ── exercises
media (storage_path → storage.objects)
site_settings (admin only)
```

### Access model

| Role | SELECT | INSERT/UPDATE | DELETE | Roles / settings |
|------|--------|---------------|--------|------------------|
| Anonymous | Published content only | — | — | — |
| viewer | Own profile | Own profile (not role) | — | — |
| editor | Draft + published | Educational tables | — | — |
| admin | All | All | All content | Profiles, site_settings |

**Self-promotion is blocked:** the `protect_profile_role` trigger prevents any user from changing their own `role`. Only an admin can change another user's role.

---

## How to apply migrations

### Option A — Supabase Dashboard (recommended for first setup)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → **New query**.
3. Run each migration file **in numeric order** (`001` → `006`). Copy the full file contents, paste, and click **Run**.
4. Confirm in **Table Editor** that all 8 tables exist.
5. Confirm in **Storage** that the `media` bucket exists (public, 5 MB limit).
6. Follow [Initial admin setup](#initial-admin-setup) below.

### Option B — Supabase CLI

```bash
# Install CLI: https://supabase.com/docs/guides/cli
npm install -g supabase

# Login and link project (once)
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations from supabase/migrations/
supabase db push

# Or reset local dev database (destructive — local only)
supabase db reset
```

### Option C — Single combined script

For dashboard one-shot apply, concatenate migrations in order:

```bash
# PowerShell (inspect output before running in dashboard)
Get-Content supabase/migrations/001_*.sql, supabase/migrations/002_*.sql, supabase/migrations/003_*.sql, supabase/migrations/004_*.sql, supabase/migrations/005_*.sql | Set-Content supabase/combined_apply.sql
```

Review `combined_apply.sql`, then run it in the SQL Editor. Do not commit generated combined files if they contain environment-specific data.

---

## Initial admin setup

**Requires a manual Supabase dashboard step.** No credentials are stored in this repository.

1. **Disable public sign-ups** (recommended):  
   Authentication → Providers → Email → disable “Enable sign up”.

2. **Create the first user:**  
   Authentication → Users → **Add user** → enter email and a strong password.  
   Do not use placeholder emails in production.

3. **Promote to admin** (SQL Editor):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'your-admin@example.com'
  LIMIT 1
);
```

4. **Verify:**

```sql
SELECT id, display_name, role, preferred_language
FROM public.profiles
WHERE role = 'admin';
```

5. Copy **Project URL** and **anon key** into `.env` (from `.env.example`). Never put the service role key in the frontend.

To grant editor access to another user:

```sql
UPDATE public.profiles SET role = 'editor' WHERE id = 'USER_UUID_HERE';
```

---

## Google sign-in (admin)

The admin login page supports **Sign in with Google** via Supabase OAuth.

### 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Create **OAuth client ID** → type **Web application**
3. **Authorized JavaScript origins:**
   - `http://localhost:5173` (local dev)
   - `https://svenskaspraket.com` (production)
4. **Authorized redirect URIs** (Supabase callback — not your app URL):
   - `https://mketbivszbnipzyafabs.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client secret**

### 2. Supabase dashboard

1. **Resume** the project if paused
2. **Authentication** → **Providers** → **Google** → Enable
3. Paste Google Client ID and Client secret → Save
4. **Authentication** → **URL Configuration** → add redirect URLs:
   - `http://localhost:5173/admin/auth/callback`
   - `https://svenskaspraket.com/admin/auth/callback`

### 3. Promote your Google account

First Google login creates a profile with role `viewer`. Promote yourself:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'mohamed@makarati.dev'
  LIMIT 1
);
```

Then sign in at `/admin/login` → **Sign in with Google**.

---

## Environment variables

Copy `.env.example` → `.env`:

| Variable | Where used | Safe in frontend? |
|----------|------------|-------------------|
| `VITE_SUPABASE_URL` | React app | Yes |
| `VITE_SUPABASE_ANON_KEY` | React app | Yes (with RLS) |
| `VITE_SITE_URL` | SEO / sitemap | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Local seed scripts only | **Never** |

---

## TypeScript types

Hand-maintained types live in:

```
src/types/database.types.ts
```

Regenerate from your live project after schema changes:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.types.ts
```

Or with a linked project:

```bash
npx supabase gen types typescript --linked > src/types/database.types.ts
```

Add to `package.json` (optional):

```bash
npm run db:types
```

---

## Validation checklist

After applying migrations, run in SQL Editor:

```sql
-- Tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles','verbs','vocabulary','lessons','exercises',
    'quiz_questions','media','site_settings'
  )
ORDER BY 1;

-- RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
  'profiles','verbs','vocabulary','lessons','exercises',
  'quiz_questions','media','site_settings'
);

-- Slug constraint works (should fail)
INSERT INTO verbs (slug, infinitive, cefr_level)
VALUES ('Invalid Slug!', 'testa', 'A1');

-- Duplicate vocabulary blocked (should fail on second insert)
INSERT INTO vocabulary (slug, word_sv, cefr_level, status)
VALUES ('hej-a1', 'hej', 'A1', 'published');
INSERT INTO vocabulary (slug, word_sv, cefr_level, status)
VALUES ('hej-a1-b', 'HEJ', 'A1', 'published');
```

Expected: slug insert fails; second vocabulary insert fails with unique violation.

Test RLS from the client with the anon key: published verbs visible, drafts not visible.

---

## Backup

### Automated (Supabase Pro)

Enable **Point-in-Time Recovery** and scheduled backups in Project Settings → Database.

### Manual before major changes

1. Dashboard → **Database** → **Backups** → download latest, or  
2. CLI dump:

```bash
supabase db dump --linked -f backup_$(date +%Y%m%d).sql
```

3. Export Storage bucket `media` via dashboard or API if you have uploaded files.

Store backups encrypted and outside the git repository.

---

## Rollback

Supabase does not auto-generate down migrations. To roll back:

### Fresh project (no production data)

1. Dashboard → **Settings** → **General** → reset database, or  
2. CLI: `supabase db reset` (local), or drop and recreate the project.

Then re-apply migrations `001`–`005`.

### Production with data

1. **Restore from backup** (preferred): Database → Backups → Restore.  
2. **Manual rollback:** write a new forward migration (e.g. `006_rollback_xxx.sql`) that undoes specific changes — never delete applied migration files from git history.

Example rollback migration header:

```sql
-- 006_rollback_example.sql — only if 002 introduced a breaking column
-- ALTER TABLE public.verbs DROP COLUMN IF EXISTS example_sv;
```

Always test rollbacks on a staging project first.

---

## Storage limits (enforced in three layers)

| Layer | Limit |
|-------|--------|
| Supabase bucket `media` | 5 MB, MIME allow-list |
| `public.media.file_size` CHECK | ≤ 5242880 bytes |
| React admin `validateUpload()` | 5 MB, SVG/PNG/JPEG/WebP |

---

## Security notes

- RLS is enabled on every table; never disable in production.
- Service role key bypasses RLS — use only in trusted server-side scripts.
- The first admin must be promoted manually; there is no backdoor seed user in migrations.
- Editors cannot delete content or modify `site_settings`.
- Users cannot change their own `role` (trigger + RLS).

---

## Next steps (application code)

The React app still references the previous schema (`content_sv`, `level`, etc.). After applying these migrations:

1. Update `src/lib/data.js` and admin forms to the new column names.
2. Update `scripts/seed-database.mjs` to seed from `public/*.json` into the new tables.
3. Extend `useAuth` to recognise `editor` role for admin routes.

Educational JSON/SVG assets in `public/` are unchanged and remain the seed source of truth.
