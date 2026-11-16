CREATE POLICY "Anyone can read photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'photos');

CREATE POLICY "Users can upload photos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update photos in own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete photos in own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);