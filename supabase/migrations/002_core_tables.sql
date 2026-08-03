-- SvenskaSpråket — 002 core tables, constraints and indexes

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'editor', 'viewer')),
  preferred_language TEXT NOT NULL DEFAULT 'sv'
    CHECK (preferred_language IN ('sv', 'en', 'ar')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. verbs
-- ---------------------------------------------------------------------------
CREATE TABLE public.verbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  infinitive TEXT NOT NULL,
  imperative TEXT,
  present TEXT,
  preterite TEXT,
  supine TEXT,
  verb_group TEXT,
  cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2')),
  meaning_en TEXT,
  meaning_ar TEXT,
  example_sv TEXT,
  example_en TEXT,
  example_ar TEXT,
  image_path TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  seo_title_sv TEXT,
  seo_title_en TEXT,
  seo_title_ar TEXT,
  seo_description_sv TEXT,
  seo_description_en TEXT,
  seo_description_ar TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT verbs_slug_valid CHECK (public.is_valid_slug(slug)),
  CONSTRAINT verbs_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_verbs_cefr_level ON public.verbs(cefr_level);
CREATE INDEX idx_verbs_status ON public.verbs(status);
CREATE INDEX idx_verbs_infinitive ON public.verbs(infinitive);
CREATE INDEX idx_verbs_published ON public.verbs(cefr_level, status)
  WHERE status = 'published';

CREATE TRIGGER verbs_set_updated_at
  BEFORE UPDATE ON public.verbs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. vocabulary
-- ---------------------------------------------------------------------------
CREATE TABLE public.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  word_sv TEXT NOT NULL,
  meaning_en TEXT,
  meaning_ar TEXT,
  example_sv TEXT,
  example_en TEXT,
  example_ar TEXT,
  word_class TEXT,
  cefr_level TEXT CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2')),
  category TEXT,
  image_path TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vocabulary_slug_valid CHECK (public.is_valid_slug(slug)),
  CONSTRAINT vocabulary_slug_unique UNIQUE (slug)
);

-- Prevent duplicate Swedish words within the same CEFR level (case-insensitive)
CREATE UNIQUE INDEX idx_vocabulary_word_sv_cefr_unique
  ON public.vocabulary (lower(trim(word_sv)), cefr_level)
  WHERE cefr_level IS NOT NULL;

CREATE INDEX idx_vocabulary_status ON public.vocabulary(status);
CREATE INDEX idx_vocabulary_cefr_level ON public.vocabulary(cefr_level);
CREATE INDEX idx_vocabulary_category ON public.vocabulary(category);

CREATE TRIGGER vocabulary_set_updated_at
  BEFORE UPDATE ON public.vocabulary
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. lessons
-- ---------------------------------------------------------------------------
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  title_sv TEXT NOT NULL,
  title_en TEXT,
  title_ar TEXT,
  summary_sv TEXT,
  summary_en TEXT,
  summary_ar TEXT,
  content_sv TEXT,
  content_en TEXT,
  content_ar TEXT,
  cefr_level TEXT CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2')),
  category TEXT,
  featured_image_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  seo_title_sv TEXT,
  seo_title_en TEXT,
  seo_title_ar TEXT,
  seo_description_sv TEXT,
  seo_description_en TEXT,
  seo_description_ar TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lessons_slug_valid CHECK (public.is_valid_slug(slug)),
  CONSTRAINT lessons_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_lessons_cefr_level ON public.lessons(cefr_level);
CREATE INDEX idx_lessons_status ON public.lessons(status);
CREATE INDEX idx_lessons_sort_order ON public.lessons(sort_order);
CREATE INDEX idx_lessons_published ON public.lessons(status, sort_order)
  WHERE status = 'published';

CREATE TRIGGER lessons_set_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. exercises
-- ---------------------------------------------------------------------------
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  instruction_sv TEXT,
  instruction_en TEXT,
  instruction_ar TEXT,
  exercise_type TEXT NOT NULL DEFAULT 'quiz',
  exercise_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_lesson_id ON public.exercises(lesson_id);
CREATE INDEX idx_exercises_status ON public.exercises(status);
CREATE INDEX idx_exercises_lesson_sort ON public.exercises(lesson_id, sort_order);

CREATE TRIGGER exercises_set_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. quiz_questions
-- ---------------------------------------------------------------------------
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  vocabulary_id UUID REFERENCES public.vocabulary(id) ON DELETE SET NULL,
  verb_id UUID REFERENCES public.verbs(id) ON DELETE SET NULL,
  question_sv TEXT NOT NULL,
  question_en TEXT,
  question_ar TEXT,
  answer_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanation_sv TEXT,
  explanation_en TEXT,
  explanation_ar TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quiz_questions_parent_check CHECK (
    lesson_id IS NOT NULL
    OR vocabulary_id IS NOT NULL
    OR verb_id IS NOT NULL
  )
);

CREATE INDEX idx_quiz_questions_lesson_id ON public.quiz_questions(lesson_id);
CREATE INDEX idx_quiz_questions_vocabulary_id ON public.quiz_questions(vocabulary_id);
CREATE INDEX idx_quiz_questions_verb_id ON public.quiz_questions(verb_id);
CREATE INDEX idx_quiz_questions_status ON public.quiz_questions(status);

CREATE TRIGGER quiz_questions_set_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. media
-- ---------------------------------------------------------------------------
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 5242880),
  alt_text_sv TEXT,
  alt_text_en TEXT,
  alt_text_ar TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT media_storage_path_unique UNIQUE (storage_path),
  CONSTRAINT media_mime_allowed CHECK (public.is_allowed_image_mime(mime_type))
);

CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by);
CREATE INDEX idx_media_mime_type ON public.media(mime_type);

-- ---------------------------------------------------------------------------
-- 8. site_settings
-- ---------------------------------------------------------------------------
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT site_settings_key_unique UNIQUE (setting_key),
  CONSTRAINT site_settings_key_valid CHECK (setting_key ~ '^[a-z][a-z0-9_]*$')
);

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
