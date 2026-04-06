-- Make selfies bucket private
UPDATE storage.buckets SET public = false WHERE name = 'selfies';

-- Add missing UPDATE policy for selfies
CREATE POLICY "Users can update own selfies"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'selfies' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add profile delete policy
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);