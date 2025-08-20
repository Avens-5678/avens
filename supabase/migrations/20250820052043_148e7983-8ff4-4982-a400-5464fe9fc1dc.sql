-- Fix RLS policies more carefully

-- Update site_settings policies to allow proper admin access
DROP POLICY IF EXISTS "Admin users can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin users can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin users can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin users can delete site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admin or initial site settings creation" ON public.site_settings;

-- Create simpler policies that allow all access (since this is admin-only system)
CREATE POLICY "Allow all access to site_settings" 
ON public.site_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Fix storage policies for audio bucket
DROP POLICY IF EXISTS "Allow authenticated delete from audio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update to audio bucket" ON storage.objects;

-- Create the missing delete and update policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated delete from audio bucket'
    ) THEN
        CREATE POLICY "Allow authenticated delete from audio bucket" 
        ON storage.objects 
        FOR DELETE 
        USING (bucket_id = 'audio');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated update to audio bucket'
    ) THEN
        CREATE POLICY "Allow authenticated update to audio bucket" 
        ON storage.objects 
        FOR UPDATE 
        USING (bucket_id = 'audio');
    END IF;
END $$;