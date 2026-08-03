-- SvenskaSpråket initial schema
-- Run in Supabase SQL Editor or via CLI

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  preferred_language TEXT NOT NULL DEFAULT 'sv' CHECK (preferred_language IN ('sv', 'en', 'ar')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verbs
CREATE TABLE IF NOT EXISTS verbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id INTEGER,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1-B2')),
  verb_group TEXT,
  imperative TEXT,
  infinitive TEXT NOT NULL,
  present TEXT,
  preterite TEXT,
  supine TEXT,
  content_sv TEXT,
  content_en TEXT,
  content_ar TEXT,
  image_path TEXT,
  is_auxiliary BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verbs_level ON verbs(level);
CREATE INDEX IF NOT EXISTS idx_verbs_status ON verbs(status);
CREATE INDEX IF NOT EXISTS idx_verbs_legacy_id ON verbs(legacy_id, level);

-- Vocabulary
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id INTEGER UNIQUE,
  content_sv TEXT NOT NULL,
  content_en TEXT,
  content_ar TEXT,
  level TEXT NOT NULL DEFAULT 'B1-B2',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_status ON vocabulary(status);
CREATE INDEX IF NOT EXISTS idx_vocabulary_level ON vocabulary(level);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_sv TEXT NOT NULL,
  title_en TEXT,
  title_ar TEXT,
  description_sv TEXT,
  description_en TEXT,
  description_ar TEXT,
  body_sv TEXT,
  body_en TEXT,
  body_ar TEXT,
  level TEXT NOT NULL,
  lesson_number INTEGER,
  rules JSONB DEFAULT '[]'::jsonb,
  examples JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);

-- Exercises (standalone exercise blocks linked to lessons)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title_sv TEXT,
  title_en TEXT,
  title_ar TEXT,
  content_sv TEXT,
  content_en TEXT,
  content_ar TEXT,
  exercise_type TEXT NOT NULL DEFAULT 'quiz',
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  question_sv TEXT NOT NULL,
  question_en TEXT,
  question_ar TEXT,
  correct_answer TEXT NOT NULL,
  choices JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  level TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  size_bytes INTEGER,
  alt_text_sv TEXT,
  alt_text_en TEXT,
  alt_text_ar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEO metadata
CREATE TABLE IF NOT EXISTS seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  slug TEXT,
  title TEXT NOT NULL,
  description TEXT,
  canonical_url TEXT,
  robots_index BOOLEAN NOT NULL DEFAULT TRUE,
  og_image TEXT,
  hreflang_sv TEXT,
  hreflang_en TEXT,
  hreflang_ar TEXT,
  structured_data JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_slug ON seo_metadata(slug);
CREATE INDEX IF NOT EXISTS idx_seo_resource ON seo_metadata(resource_type, resource_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER verbs_updated_at BEFORE UPDATE ON verbs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER vocabulary_updated_at BEFORE UPDATE ON vocabulary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER quiz_questions_updated_at BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER media_updated_at BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER seo_metadata_updated_at BEFORE UPDATE ON seo_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper: check admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON profiles
  FOR SELECT USING (is_admin());
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Public read published content
CREATE POLICY "Public read published verbs" ON verbs
  FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published vocabulary" ON vocabulary
  FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published lessons" ON lessons
  FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published exercises" ON exercises
  FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published quiz" ON quiz_questions
  FOR SELECT USING (status = 'published');
CREATE POLICY "Public read media" ON media
  FOR SELECT USING (TRUE);
CREATE POLICY "Public read published seo" ON seo_metadata
  FOR SELECT USING (status = 'published');

-- Admin full access
CREATE POLICY "Admin all verbs" ON verbs
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin all vocabulary" ON vocabulary
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin all lessons" ON lessons
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin all exercises" ON exercises
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin all quiz" ON quiz_questions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin all media" ON media
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin all seo" ON seo_metadata
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Storage bucket (run separately in Supabase dashboard or storage API)
-- Bucket: media (public read, admin write)
