
-- Create the audio storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);

-- Allow authenticated users to upload audio
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio');

-- Allow authenticated users to delete audio
CREATE POLICY "Authenticated users can delete audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio');

-- Allow public read access to audio
CREATE POLICY "Public can read audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');
