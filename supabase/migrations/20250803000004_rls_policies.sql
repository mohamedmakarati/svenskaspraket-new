-- SvenskaSpråket — 004 Row Level Security policies

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
-- media — public read; editors upload; admins delete
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
-- site_settings — admins only (sensitive configuration)
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
