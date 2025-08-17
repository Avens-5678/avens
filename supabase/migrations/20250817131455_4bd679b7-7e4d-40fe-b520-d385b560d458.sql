-- Drop existing storage policies for audio bucket to fix conflicts
DROP POLICY IF EXISTS "Admins can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update audio files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete audio files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view audio files" ON storage.objects;

-- Create new storage policies for audio bucket
CREATE POLICY "Allow admin upload audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'audio' 
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Allow admin update audio files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'audio' 
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  bucket_id = 'audio' 
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Allow admin delete audio files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'audio' 
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Allow public view audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio');