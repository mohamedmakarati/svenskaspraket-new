-- SvenskaSprÃ¥ket â€” 001 extensions and shared helpers
-- Safe to re-run helper definitions (CREATE OR REPLACE / IF NOT EXISTS).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared trigger: maintain updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Role helpers (SECURITY DEFINER â€” read profiles for auth.uid())
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- ---------------------------------------------------------------------------
-- Slug validation (lowercase letters, digits, single hyphens between segments)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_valid_slug(value TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$';
$$;

-- ---------------------------------------------------------------------------
-- Approved image MIME types (mirrored in storage policies + frontend)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_allowed_image_mime(mime TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT mime = ANY (ARRAY[
    'image/svg+xml',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]::TEXT[]);
$$;

-- Max upload size enforced in application code (5 MB). Documented constant:
-- SELECT 5242880;

COMMENT ON FUNCTION public.is_allowed_image_mime IS
  'Allowed storage MIME types. Max file size (5 MB) is enforced in the React admin app.';
-- SvenskaSprÃ¥ket â€” 002 core tables, constraints and indexes

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
-- SvenskaSprÃ¥ket â€” 003 auth hooks, audit fields and role protection

-- ---------------------------------------------------------------------------
-- Auto-create profile when a user registers (default role: viewer)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'viewer',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'sv')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Prevent self role promotion / demotion; only admins may change others' roles
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Block self-service role changes for authenticated sessions
    IF auth.uid() IS NOT NULL AND NEW.id = auth.uid() THEN
      RAISE EXCEPTION 'Users cannot change their own role'
        USING ERRCODE = '42501';
    END IF;
    -- Allow dashboard SQL (auth.uid() IS NULL) and admins changing other users
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can change user roles'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Stamp created_by / updated_by on educational content (editors + admins)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.stamp_content_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_by IS NULL AND auth.uid() IS NOT NULL THEN
      NEW.created_by := auth.uid();
    END IF;
    NEW.updated_by := COALESCE(auth.uid(), NEW.updated_by);
  ELSIF TG_OP = 'UPDATE' THEN
    IF auth.uid() IS NOT NULL THEN
      NEW.updated_by := auth.uid();
    END IF;
    NEW.created_by := OLD.created_by;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER verbs_stamp_audit
  BEFORE INSERT OR UPDATE ON public.verbs
  FOR EACH ROW EXECUTE FUNCTION public.stamp_content_audit();

CREATE TRIGGER vocabulary_stamp_audit
  BEFORE INSERT OR UPDATE ON public.vocabulary
  FOR EACH ROW EXECUTE FUNCTION public.stamp_content_audit();

CREATE TRIGGER lessons_stamp_audit
  BEFORE INSERT OR UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.stamp_content_audit();

-- Set published_at when a lesson is first published
CREATE OR REPLACE FUNCTION public.set_lesson_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    NEW.published_at := COALESCE(NEW.published_at, NOW());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER lessons_set_published_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_lesson_published_at();

-- ---------------------------------------------------------------------------
-- INITIAL ADMIN SETUP (manual â€” run once in Supabase SQL Editor after creating
-- the first user in Authentication â†’ Users):
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE id = (
--     SELECT id FROM auth.users
--     WHERE email = 'your-admin@example.com'
--     LIMIT 1
--   );
--
-- Never commit real emails or credentials. Disable public sign-ups in
-- Authentication â†’ Providers â†’ Email unless you want invite-only registration.
-- ---------------------------------------------------------------------------

COMMENT ON TABLE public.profiles IS
  'Extends auth.users. Promote the first admin manually via Supabase dashboard SQL (see migration 003 header).';
-- SvenskaSprÃ¥ket â€” 004 Row Level Security policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- role changes blocked by protect_profile_role trigger
  );

CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- verbs
-- ---------------------------------------------------------------------------
CREATE POLICY verbs_select_published ON public.verbs
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY verbs_select_editor ON public.verbs
  FOR SELECT TO authenticated
  USING (public.is_editor_or_admin());

CREATE POLICY verbs_insert_editor ON public.verbs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY verbs_update_editor ON public.verbs
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY verbs_delete_admin ON public.verbs
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- vocabulary
-- ---------------------------------------------------------------------------
CREATE POLICY vocabulary_select_published ON public.vocabulary
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY vocabulary_select_editor ON public.vocabulary
  FOR SELECT TO authenticated
  USING (public.is_editor_or_admin());

CREATE POLICY vocabulary_insert_editor ON public.vocabulary
  FOR INSERT TO authenticated
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY vocabulary_update_editor ON public.vocabulary
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY vocabulary_delete_admin ON public.vocabulary
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------------
CREATE POLICY lessons_select_published ON public.lessons
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY lessons_select_editor ON public.lessons
  FOR SELECT TO authenticated
  USING (public.is_editor_or_admin());

CREATE POLICY lessons_insert_editor ON public.lessons
  FOR INSERT TO authenticated
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY lessons_update_editor ON public.lessons
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY lessons_delete_admin ON public.lessons
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- exercises
-- ---------------------------------------------------------------------------
CREATE POLICY exercises_select_published ON public.exercises
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY exercises_select_editor ON public.exercises
  FOR SELECT TO authenticated
  USING (public.is_editor_or_admin());

CREATE POLICY exercises_insert_editor ON public.exercises
  FOR INSERT TO authenticated
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY exercises_update_editor ON public.exercises
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY exercises_delete_admin ON public.exercises
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- quiz_questions
-- ---------------------------------------------------------------------------
CREATE POLICY quiz_questions_select_published ON public.quiz_questions
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY quiz_questions_select_editor ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (public.is_editor_or_admin());

CREATE POLICY quiz_questions_insert_editor ON public.quiz_questions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY quiz_questions_update_editor ON public.quiz_questions
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY quiz_questions_delete_admin ON public.quiz_questions
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- media â€” public read; editors upload; admins delete
-- ---------------------------------------------------------------------------
CREATE POLICY media_select_public ON public.media
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY media_insert_editor ON public.media
  FOR INSERT TO authenticated
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY media_update_editor ON public.media
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY media_delete_admin ON public.media
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- site_settings â€” admins only (sensitive configuration)
-- ---------------------------------------------------------------------------
CREATE POLICY site_settings_select_admin ON public.site_settings
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY site_settings_insert_admin ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY site_settings_update_admin ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY site_settings_delete_admin ON public.site_settings
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Optional: expose non-sensitive public settings via a future view + policy.
-- Example keys: site_name, default_language (store in site_settings).
-- SvenskaSprÃ¥ket â€” 005 Storage bucket and policies
-- Bucket: media (public read for published site images)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  TRUE,
  5242880,
  ARRAY['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- storage.objects policies for bucket "media"
-- ---------------------------------------------------------------------------

-- Anyone can view images (public learning site)
CREATE POLICY media_storage_select_public ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

-- Editors and admins may upload (bucket allowed_mime_types + file_size_limit enforced by Supabase Storage API)
CREATE POLICY media_storage_insert_editor ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND public.is_editor_or_admin()
  );

-- Editors may update/replace objects; admins may update any
CREATE POLICY media_storage_update_editor ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'media'
    AND public.is_editor_or_admin()
  )
  WITH CHECK (
    bucket_id = 'media'
    AND public.is_editor_or_admin()
  );

-- Only administrators may delete storage objects
CREATE POLICY media_storage_delete_admin ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'media'
    AND public.is_admin()
  );

COMMENT ON TABLE storage.buckets IS
  'media bucket: 5 MB limit, SVG/PNG/JPEG/WebP only. Matches public.media.file_size CHECK and frontend validateUpload().';
-- SvenskaSprÃ¥ket â€” 006 stable source keys for idempotent content import
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

COMMENT ON COLUMN public.verbs.source_key IS 'Stable import id e.g. verb:a1:001 â€” used by import scripts for upsert';
-- SvenskaSprÃ¥ket â€” 007 OAuth profile display names from Google metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      split_part(NEW.email, '@', 1)
    ),
    'viewer',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'sv')
  );
  RETURN NEW;
END;
$$;
