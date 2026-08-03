# SvenskaSpråket — React + Vite + Supabase

A multilingual Swedish learning platform (A1–C1) with a public website and secure admin panel.

## Features

### Public website
- Swedish `/`, English `/en`, Arabic `/ar` (RTL)
- Verbs by CEFR level: `/verbs`, `/verbs-a2`, `/verbs-b1b2`
- Vocabulary with search, filters, pagination: `/vocabulary`
- Grammar lessons: `/lessons-a1`, `/lessons`
- Supabase-first data with static JSON fallback (site stays usable offline)
- SEO: canonical URLs, hreflang, JSON-LD, sitemap

### Admin panel (`/admin`)
- Supabase Auth (email/password)
- Roles: admin, editor, viewer
- CRUD for verbs, vocabulary, lessons, quizzes, media
- SV / EN / AR interface with RTL for Arabic
- `noindex` on all admin routes

## Tech stack

- **React 19** + **Vite 7** + **Node.js 22**
- **React Router 7** (lazy-loaded routes)
- **Supabase** (PostgreSQL, Auth, Storage, RLS)
- **TanStack Query**, React Hook Form, Zod, i18next

## Local development

**Requirements:** Node.js 22, npm 10+

```bash
git clone https://github.com/mohamedmakarati/svenskaspraket-new.git
cd svenskaspraket-new
npm ci
cp .env.example .env
# Edit .env — VITE_* keys only for frontend dev
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

The public site works without Supabase (static JSON fallback). Admin requires valid `VITE_SUPABASE_*` keys.

## Environment variables

Copy `.env.example` → `.env` (never commit `.env`).

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | Frontend build | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend build | Public anon key (safe in browser) |
| `VITE_SITE_URL` | Frontend build | Canonical URL (default: svenskaspraket.com) |
| `SUPABASE_SERVICE_ROLE_KEY` | Local scripts only | **Never** in Hostinger or GitHub build vars |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | Route, i18n, SEO checks |
| `npm run lint:secrets` | Scan for committed secrets |
| `npm run ci` | Full CI suite locally |
| `npm run import:validate` | Validate content import (no DB) |

## Deployment (Hostinger)

Hostinger auto-deploys from the **`main`** branch. Do **not** push to `main` until CI passes.

| Setting | Value |
|---------|-------|
| Node.js | **22** |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |

Set build environment variables in Hostinger (see `.env.example`). See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full checklist.

### SPA routing

`public/.htaccess` is copied to `dist/` and handles:
- HTTPS redirect
- SPA fallback for client routes (`/en`, `/admin/verbs`, etc.)
- Direct serving of `sitemap.xml`, `robots.txt`, images, JSON
- Security headers compatible with Supabase (CSP allows `*.supabase.co`)

**Test after deploy:** refresh `/admin/verbs`, `/en`, `/vocabulary` directly in the browser.

## CI / GitHub Actions

On every push and pull request to `main`, CI runs:

1. `npm ci`
2. Secret scan
3. Route & link validation
4. i18n key sync (sv/en/ar)
5. SEO metadata & JSON-LD validation
6. Unit tests
7. Production build

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — validates only; Hostinger handles deploy.

Run locally: `npm run ci`

## Database & content

1. Apply migrations `001`–`006` in Supabase (see [supabase/README.md](supabase/README.md))
2. Create first admin in Supabase Auth, then set role in `profiles`
3. Import content: [scripts/import/README.md](scripts/import/README.md)

## Project structure

```
├── src/pages/           Public + admin pages
├── src/lib/publicQueries.js   Supabase + fallback data layer
├── src/components/      Shared UI, SEO, admin components
├── public/              Static assets, .htaccess, JSON fallbacks
├── scripts/ci/          Automated checks
├── scripts/import/      Idempotent content import
├── supabase/migrations/ Versioned SQL
├── .github/workflows/   CI pipeline
└── DEPLOYMENT.md        Pre-deploy checklist
```

## Security

- Row Level Security on all tables; anon reads published content only
- Service role key never in frontend or Hostinger build
- Admin routes: `noindex,nofollow` + `robots.txt` disallow
- Production builds: source maps disabled
- CSP allows Supabase API/Storage; blocks inline scripts

## License

Student-driven educational resource. Not affiliated with Lund University.
