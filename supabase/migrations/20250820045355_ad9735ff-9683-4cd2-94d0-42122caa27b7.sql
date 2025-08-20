-- Fix storage RLS policies to allow admin access for image uploads

-- Create policies for portfolio-images bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to portfolio-images" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to portfolio-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio-images');

CREATE POLICY "Allow public access to portfolio-images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Allow authenticated updates to portfolio-images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Allow authenticated deletes from portfolio-images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'portfolio-images');

-- Create policies for event-hero-images bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to event-hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to event-hero-images" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to event-hero-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-hero-images');

CREATE POLICY "Allow public access to event-hero-images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'event-hero-images');

CREATE POLICY "Allow authenticated updates to event-hero-images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'event-hero-images');

CREATE POLICY "Allow authenticated deletes from event-hero-images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'event-hero-images');

-- Create policies for specialty-images bucket  
DROP POLICY IF EXISTS "Allow authenticated uploads to specialty-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to specialty-images" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to specialty-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'specialty-images');

CREATE POLICY "Allow public access to specialty-images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'specialty-images');