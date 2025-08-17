-- Create storage policies for portfolio images
CREATE POLICY "Anyone can view portfolio images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Admins can upload portfolio images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolio-images' AND (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE id = auth.uid() AND is_active = true
)));

CREATE POLICY "Admins can update portfolio images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'portfolio-images' AND (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE id = auth.uid() AND is_active = true
)));

CREATE POLICY "Admins can delete portfolio images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'portfolio-images' AND (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE id = auth.uid() AND is_active = true
)));

-- Create storage policies for event hero images
CREATE POLICY "Anyone can view event hero images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-hero-images');

CREATE POLICY "Admins can upload event hero images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'event-hero-images' AND (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE id = auth.uid() AND is_active = true
)));

CREATE POLICY "Admins can update event hero images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'event-hero-images' AND (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE id = auth.uid() AND is_active = true
)));

CREATE POLICY "Admins can delete event hero images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'event-hero-images' AND (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE id = auth.uid() AND is_active = true
)));