-- Setup storage bucket for ticket images
-- Run this in Supabase SQL Editor

-- Create storage bucket for ticket images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-images',
  'ticket-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Create RLS policy for ticket images
CREATE POLICY "Users can upload their own ticket images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ticket-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own ticket images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ticket-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own ticket images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ticket-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own ticket images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ticket-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'ticket-images';

-- Verify RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname='storage' 
  AND tablename='objects'
  AND policyname LIKE '%ticket%'
ORDER BY policyname;
