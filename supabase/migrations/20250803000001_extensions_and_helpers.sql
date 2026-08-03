-- SvenskaSpråket — 001 extensions and shared helpers
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
-- Role helpers (SECURITY DEFINER — read profiles for auth.uid())
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
