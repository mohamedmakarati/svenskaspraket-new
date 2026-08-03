-- SvenskaSpråket — 006 stable source keys for idempotent content import
-- Enables upsert by source_key in scripts/import-content.mjs

ALTER TABLE public.verbs
  ADD COLUMN IF NOT EXISTS source_key TEXT;

ALTER TABLE public.vocabulary
  ADD COLUMN IF NOT EXISTS source_key TEXT;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS source_key TEXT;

ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS source_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_verbs_source_key_unique
  ON public.verbs (source_key) WHERE source_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vocabulary_source_key_unique
  ON public.vocabulary (source_key) WHERE source_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_source_key_unique
  ON public.lessons (source_key) WHERE source_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_questions_source_key_unique
  ON public.quiz_questions (source_key) WHERE source_key IS NOT NULL;

COMMENT ON COLUMN public.verbs.source_key IS 'Stable import id e.g. verb:a1:001 — used by import scripts for upsert';
