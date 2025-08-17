-- Create storage buckets for portfolio images
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('event-hero-images', 'event-hero-images', true);

-- Create policies for portfolio images
CREATE POLICY "Portfolio images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Admins can upload portfolio images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolio-images' AND auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

CREATE POLICY "Admins can update portfolio images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'portfolio-images' AND auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

CREATE POLICY "Admins can delete portfolio images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'portfolio-images' AND auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Create policies for event hero images
CREATE POLICY "Event hero images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-hero-images');

CREATE POLICY "Admins can upload event hero images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'event-hero-images' AND auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

CREATE POLICY "Admins can update event hero images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'event-hero-images' AND auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

CREATE POLICY "Admins can delete event hero images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'event-hero-images' AND auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));