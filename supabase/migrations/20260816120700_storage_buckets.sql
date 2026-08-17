INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('media', 'media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('avatars', 'avatars', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('covers', 'covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY storage_media_public_read
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('media', 'avatars', 'covers'));

CREATE POLICY storage_media_admin_insert
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('media', 'covers')
  AND public.is_admin()
);

CREATE POLICY storage_avatars_insert_own
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY storage_media_admin_update
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id IN ('media', 'covers') AND public.is_admin())
WITH CHECK (bucket_id IN ('media', 'covers') AND public.is_admin());

CREATE POLICY storage_avatars_update_own
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY storage_media_admin_delete
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id IN ('media', 'covers') AND public.is_admin());

CREATE POLICY storage_avatars_delete_own
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
