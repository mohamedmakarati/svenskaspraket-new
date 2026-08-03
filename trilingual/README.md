# SvenskaSpråket — React + Vite + Supabase

A multilingual Swedish learning platform (A1–B2) with a public website and admin panel.

## Features

### Public website
- Swedish homepage at `/`
- English homepage at `/en`
- Arabic homepage at `/ar` (RTL layout)
- Verb pages: `/verbs` (A1), `/verbs-a2`, `/verbs-b1b2`
- Vocabulary with flashcards and quiz: `/vocabulary`
- Grammar lessons: `/lessons-a1`, `/lessons`
- Legacy `.html` URLs redirect automatically
- SEO: canonical URLs, hreflang, JSON-LD, sitemap

### Admin panel (`/admin`)
- Supabase email/password authentication
- Protected routes (admin role required)
- SV / EN / AR interface with RTL for Arabic
- CRUD for verbs, vocabulary, lessons, quiz questions
- Media upload (SVG, PNG, JPEG, WebP — max 2 MB)
- Draft / published states, preview, export JSON/CSV

### Educational content (preserved)
| Content | Count |
|---------|-------|
| A1 verbs | 131 |
| A2 verbs | 199 |
| B1–B2 verbs | 135 |
| Vocabulary | 805 |
| Verb images | 465 SVGs |
| Grammar lessons | A1 + 4 B1–B2 |

## Tech stack

- React 19 + Vite 7
- React Router 7 (lazy-loaded routes)
- Supabase (PostgreSQL + Auth + Storage)
- react-i18next, React Hook Form, Zod
- Custom SEO head manager (canonical, hreflang, JSON-LD)

## Quick start

```bash
cd trilingual
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Admin only | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Admin only | Public anon key (safe for frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed script only | **Never expose in frontend** |
| `VITE_SITE_URL` | Optional | Canonical base URL (default: svenskaspraket.com) |

> **Note:** The public site works without Supabase — it falls back to static JSON files in `public/`.

## Database setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Create a Storage bucket named `media` (public read)
4. Create an admin user via Authentication → Users
5. Set admin role:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
6. Seed existing content:
   ```bash
   npm run seed
   ```

## Build & deploy

```bash
npm run build    # outputs to dist/
npm run preview  # preview production build
```

Upload `dist/` contents to your web host. The included `public/.htaccess` handles SPA routing and HTTPS redirect.

## Project structure

```
trilingual/
├── src/
│   ├── pages/          # Public + admin pages
│   ├── components/     # Shared UI
│   ├── layouts/        # Admin layout
│   ├── hooks/          # Auth, RTL
│   ├── lib/            # Supabase, data layer, utils
│   ├── schemas/        # Zod validation
│   ├── data/           # Preserved static lesson content
│   ├── i18n/           # Translations (sv, en, ar)
│   └── styles/         # Global CSS
├── public/             # Static assets (JSON, images, sitemap)
├── supabase/migrations/
├── scripts/seed-database.mjs
└── index.html
```

## Security

- Row Level Security on all tables
- Public users: read published content only
- Admins: full CRUD via authenticated RLS policies
- Service role key used only in seed script (server-side)
- Form validation with Zod
- HTML sanitization with DOMPurify
- Upload validation by MIME type and size

## License

Student-driven educational resource. Not affiliated with Lund University.
