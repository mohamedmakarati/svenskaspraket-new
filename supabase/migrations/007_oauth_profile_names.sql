-- SvenskaSpråket — 007 OAuth profile display names from Google metadata

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
