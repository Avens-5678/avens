
-- Fix 1: Drop the SELECT RLS policy on admin_users that exposes password_hash
DROP POLICY IF EXISTS "Super admin can view admin users" ON public.admin_users;

-- Add column-level REVOKE for defense-in-depth
REVOKE ALL ON public.admin_users FROM anon, authenticated;

-- Fix 2: Drop overly permissive storage policies and replace with admin-only
-- Portfolio images
DROP POLICY IF EXISTS "Allow authenticated uploads to portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to portfolio-images" ON storage.objects;

CREATE POLICY "Admins can upload to portfolio-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-images' AND is_admin_secure());

CREATE POLICY "Admins can update portfolio-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-images' AND is_admin_secure())
  WITH CHECK (bucket_id = 'portfolio-images' AND is_admin_secure());

CREATE POLICY "Admins can delete from portfolio-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-images' AND is_admin_secure());

-- Event hero images
DROP POLICY IF EXISTS "Allow authenticated uploads to event-hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from event-hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to event-hero-images" ON storage.objects;

CREATE POLICY "Admins can upload to event-hero-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-hero-images' AND is_admin_secure());

CREATE POLICY "Admins can update event-hero-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'event-hero-images' AND is_admin_secure())
  WITH CHECK (bucket_id = 'event-hero-images' AND is_admin_secure());

CREATE POLICY "Admins can delete from event-hero-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'event-hero-images' AND is_admin_secure());

-- Specialty images
DROP POLICY IF EXISTS "Allow authenticated uploads to specialty-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from specialty-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to specialty-images" ON storage.objects;

CREATE POLICY "Admins can upload to specialty-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'specialty-images' AND is_admin_secure());

CREATE POLICY "Admins can update specialty-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'specialty-images' AND is_admin_secure())
  WITH CHECK (bucket_id = 'specialty-images' AND is_admin_secure());

CREATE POLICY "Admins can delete from specialty-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'specialty-images' AND is_admin_secure());

-- Banner images
DROP POLICY IF EXISTS "Allow authenticated uploads to banner-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from banner-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to banner-images" ON storage.objects;

CREATE POLICY "Admins can upload to banner-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banner-images' AND is_admin_secure());

CREATE POLICY "Admins can update banner-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'banner-images' AND is_admin_secure())
  WITH CHECK (bucket_id = 'banner-images' AND is_admin_secure());

CREATE POLICY "Admins can delete from banner-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'banner-images' AND is_admin_secure());

-- Client logos
DROP POLICY IF EXISTS "Allow authenticated uploads to client-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from client-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to client-logos" ON storage.objects;

CREATE POLICY "Admins can upload to client-logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-logos' AND is_admin_secure());

CREATE POLICY "Admins can update client-logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'client-logos' AND is_admin_secure())
  WITH CHECK (bucket_id = 'client-logos' AND is_admin_secure());

CREATE POLICY "Admins can delete from client-logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'client-logos' AND is_admin_secure());

-- General uploads
DROP POLICY IF EXISTS "Allow authenticated uploads to general-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from general-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to general-uploads" ON storage.objects;

CREATE POLICY "Admins can upload to general-uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'general-uploads' AND is_admin_secure());

CREATE POLICY "Admins can update general-uploads" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'general-uploads' AND is_admin_secure())
  WITH CHECK (bucket_id = 'general-uploads' AND is_admin_secure());

CREATE POLICY "Admins can delete from general-uploads" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'general-uploads' AND is_admin_secure());

-- Audio bucket
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to audio" ON storage.objects;

CREATE POLICY "Admins can upload audio" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audio' AND is_admin_secure());

CREATE POLICY "Admins can update audio" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'audio' AND is_admin_secure())
  WITH CHECK (bucket_id = 'audio' AND is_admin_secure());

CREATE POLICY "Admins can delete audio" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'audio' AND is_admin_secure());
