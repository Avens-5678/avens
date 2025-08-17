-- Fix site_settings RLS policies to work with admin authentication
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "admin_can_insert_site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "admin_can_update_site_settings" ON public.site_settings;

-- Create proper RLS policies for site_settings that work with admin_users table
CREATE POLICY "Admins can insert site settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admins can update site settings" 
ON public.site_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admins can delete site settings" 
ON public.site_settings 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Ensure there's always a site_settings record
INSERT INTO public.site_settings (background_audio_url, background_audio_enabled)
SELECT null, false
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- Create storage policies for audio bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('audio', 'audio', true, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];

-- Create storage policies for audio uploads
CREATE POLICY "Admins can upload audio files" 
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

CREATE POLICY "Admins can update audio files" 
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

CREATE POLICY "Admins can delete audio files" 
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

CREATE POLICY "Public can view audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio');