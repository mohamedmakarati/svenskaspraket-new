# SvenskaSpråket — Deployment Checklist

Use this before merging to `main` (Hostinger auto-deploys from `main`).

## Pre-merge (local or CI)

- [ ] `npm ci` — clean install from lockfile
- [ ] `npm run ci` — all automated checks pass
- [ ] GitHub Actions CI green on the pull request
- [ ] No `.env` files staged (`npm run lint:secrets`)
- [ ] `VITE_*` vars set in Hostinger (not service role key)

## Hostinger configuration

| Setting | Value |
|---------|-------|
| **Framework** | Vite / React |
| **Node.js** | 22 |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Install command** | `npm ci` |

### Environment variables (Hostinger panel)

Set these for the **build** step only:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://svenskaspraket.com
```

Never add `SUPABASE_SERVICE_ROLE_KEY` to Hostinger — import scripts run locally only.

## Post-deploy smoke test

Refresh each route directly (SPA fallback must work):

| URL | Expected |
|-----|----------|
| `/` | Swedish homepage |
| `/en` | English homepage |
| `/ar` | Arabic homepage (RTL) |
| `/verbs` | A1 verbs table |
| `/vocabulary` | Vocabulary page |
| `/admin` | Redirect to login or dashboard |
| `/admin/verbs` | Admin verbs list (auth required) |

### Static files (must NOT 404)

- [ ] `/sitemap.xml`
- [ ] `/robots.txt`
- [ ] `/og-image.png`
- [ ] `/favicon.svg`
- [ ] `/verbs-data.json` (fallback)

## Security verification

- [ ] `/admin` and `/admin/login` return `noindex` meta (view source)
- [ ] `robots.txt` disallows `/admin`
- [ ] Browser DevTools → Network: Supabase API calls succeed (no CSP blocks)
- [ ] Storage image URLs load from `*.supabase.co`
- [ ] No source maps in production (`dist/assets/*.js` has no `.map` siblings)

## Rollback

1. Hostinger → Deployments → redeploy previous successful build, **or**
2. Git: `git revert` the bad commit on `main` and push (triggers new deploy)

## Database / content (separate from frontend deploy)

Content import is **not** part of Hostinger deploy:

```bash
npm run import:validate
npm run import:dry-run
IMPORT_ENV=staging npm run import:content   # after backup + approval
```

See [scripts/import/README.md](scripts/import/README.md) and [supabase/README.md](supabase/README.md).
