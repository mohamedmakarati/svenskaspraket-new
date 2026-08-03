-- SvenskaSpråket — 005 Storage bucket and policies
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
