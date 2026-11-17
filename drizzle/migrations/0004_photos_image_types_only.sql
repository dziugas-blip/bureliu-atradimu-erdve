DROP POLICY IF EXISTS "Users can upload photos to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update photos in own folder" ON storage.objects;

CREATE POLICY "Users can upload photos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
);

CREATE POLICY "Users can update photos in own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
);