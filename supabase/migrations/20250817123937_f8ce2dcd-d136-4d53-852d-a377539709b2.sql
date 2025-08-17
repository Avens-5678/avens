-- Create storage bucket for specialty images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('specialty-images', 'specialty-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for specialty images
CREATE POLICY "Anyone can view specialty images" ON storage.objects
FOR SELECT USING (bucket_id = 'specialty-images');

CREATE POLICY "Authenticated users can upload specialty images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'specialty-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update specialty images" ON storage.objects
FOR UPDATE USING (bucket_id = 'specialty-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete specialty images" ON storage.objects
FOR DELETE USING (bucket_id = 'specialty-images' AND auth.role() = 'authenticated');