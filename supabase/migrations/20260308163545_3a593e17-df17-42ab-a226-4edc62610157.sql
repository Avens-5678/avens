
-- Fix audio bucket: drop existing admin policies first, then recreate
DROP POLICY IF EXISTS "Admins can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete audio" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to audio" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from audio" ON storage.objects;

CREATE POLICY "Admins can upload audio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audio' AND is_admin_secure());
CREATE POLICY "Admins can delete audio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'audio' AND is_admin_secure());
