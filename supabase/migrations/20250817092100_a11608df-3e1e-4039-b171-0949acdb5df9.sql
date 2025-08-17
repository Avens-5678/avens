-- Drop existing storage policies that are causing issues
DROP POLICY IF EXISTS "Admins can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload event hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update event hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete event hero images" ON storage.objects;

-- Create new storage policies that work with regular authentication
CREATE POLICY "Authenticated users can upload portfolio images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolio-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update portfolio images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'portfolio-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete portfolio images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'portfolio-images' AND auth.uid() IS NOT NULL);

-- Create new storage policies for event hero images
CREATE POLICY "Authenticated users can upload event hero images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'event-hero-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update event hero images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'event-hero-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete event hero images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'event-hero-images' AND auth.uid() IS NOT NULL);