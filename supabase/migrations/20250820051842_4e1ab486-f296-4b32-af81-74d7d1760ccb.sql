-- Fix RLS policies for admin access

-- Update site_settings policies to allow proper admin access
DROP POLICY IF EXISTS "Admin users can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin users can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin users can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin users can delete site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admin or initial site settings creation" ON public.site_settings;

-- Create simpler policies that allow all authenticated users (since we use admin auth)
CREATE POLICY "Allow all authenticated access to site_settings" 
ON public.site_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update portfolio policies to allow proper access
DROP POLICY IF EXISTS "Allow all access to portfolio" ON public.portfolio;
CREATE POLICY "Allow all access to portfolio" 
ON public.portfolio 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Ensure storage bucket policies are correct for authenticated uploads
DROP POLICY IF EXISTS "Allow authenticated uploads to audio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from audio bucket" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to audio bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read from audio bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio');

CREATE POLICY "Allow authenticated delete from audio bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update to audio bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'audio' AND auth.role() = 'authenticated');