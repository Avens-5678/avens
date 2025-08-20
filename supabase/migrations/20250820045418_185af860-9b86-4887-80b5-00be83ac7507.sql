-- Check existing policies and create missing ones for storage buckets

-- First, remove conflicting policies if they exist
DO $$
BEGIN
    -- Drop existing policies to recreate them cleanly
    DROP POLICY IF EXISTS "Allow authenticated uploads to portfolio-images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated uploads to event-hero-images" ON storage.objects;  
    DROP POLICY IF EXISTS "Allow authenticated uploads to specialty-images" ON storage.objects;
END $$;

-- Create storage policies for portfolio-images
CREATE POLICY "Allow authenticated uploads to portfolio-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio-images');

-- Create storage policies for event-hero-images  
CREATE POLICY "Allow authenticated uploads to event-hero-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-hero-images');

-- Create storage policies for specialty-images
CREATE POLICY "Allow authenticated uploads to specialty-images" ON storage.objects
FOR INSERT TO authenticated  
WITH CHECK (bucket_id = 'specialty-images');