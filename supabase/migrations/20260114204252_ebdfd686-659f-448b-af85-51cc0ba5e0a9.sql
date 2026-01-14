-- =============================================
-- STORAGE BUCKETS CREATION
-- portfolio-images, event-hero-images, specialty-images
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('portfolio-images', 'portfolio-images', true),
  ('event-hero-images', 'event-hero-images', true),
  ('specialty-images', 'specialty-images', true);

-- =============================================
-- RLS POLICIES FOR PORTFOLIO-IMAGES
-- =============================================

-- Public read access
CREATE POLICY "Public can view portfolio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-images' AND auth.uid() IS NOT NULL);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update portfolio images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-images' AND auth.uid() IS NOT NULL);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete portfolio images"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-images' AND auth.uid() IS NOT NULL);

-- =============================================
-- RLS POLICIES FOR EVENT-HERO-IMAGES
-- =============================================

-- Public read access
CREATE POLICY "Public can view event hero images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-hero-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload event hero images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-hero-images' AND auth.uid() IS NOT NULL);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update event hero images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-hero-images' AND auth.uid() IS NOT NULL);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete event hero images"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-hero-images' AND auth.uid() IS NOT NULL);

-- =============================================
-- RLS POLICIES FOR SPECIALTY-IMAGES
-- =============================================

-- Public read access
CREATE POLICY "Public can view specialty images"
ON storage.objects FOR SELECT
USING (bucket_id = 'specialty-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload specialty images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'specialty-images' AND auth.uid() IS NOT NULL);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update specialty images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'specialty-images' AND auth.uid() IS NOT NULL);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete specialty images"
ON storage.objects FOR DELETE
USING (bucket_id = 'specialty-images' AND auth.uid() IS NOT NULL);