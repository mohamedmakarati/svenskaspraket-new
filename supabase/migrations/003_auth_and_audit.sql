-- SvenskaSpråket — 003 auth hooks, audit fields and role protection

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
-- INITIAL ADMIN SETUP (manual — run once in Supabase SQL Editor after creating
-- the first user in Authentication → Users):
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
-- Authentication → Providers → Email unless you want invite-only registration.
-- ---------------------------------------------------------------------------

COMMENT ON TABLE public.profiles IS
  'Extends auth.users. Promote the first admin manually via Supabase dashboard SQL (see migration 003 header).';
