-- =============================================
-- ADDITIONAL STORAGE BUCKETS
-- For banners, client logos, and general uploads
-- =============================================

-- Create additional buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('banner-images', 'banner-images', true),
  ('client-logos', 'client-logos', true),
  ('general-uploads', 'general-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- RLS POLICIES FOR BANNER-IMAGES
-- =============================================

CREATE POLICY "Public can view banner images"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

CREATE POLICY "Authenticated users can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banner-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update banner images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banner-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banner-images' AND auth.uid() IS NOT NULL);

-- =============================================
-- RLS POLICIES FOR CLIENT-LOGOS
-- =============================================

CREATE POLICY "Public can view client logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-logos');

CREATE POLICY "Authenticated users can upload client logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'client-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update client logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'client-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete client logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'client-logos' AND auth.uid() IS NOT NULL);

-- =============================================
-- RLS POLICIES FOR GENERAL-UPLOADS
-- =============================================

CREATE POLICY "Public can view general uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'general-uploads');

CREATE POLICY "Authenticated users can upload general files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'general-uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update general files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'general-uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete general files"
ON storage.objects FOR DELETE
USING (bucket_id = 'general-uploads' AND auth.uid() IS NOT NULL);