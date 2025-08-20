-- Add before/after image columns to portfolio table
ALTER TABLE public.portfolio 
ADD COLUMN before_image_url text,
ADD COLUMN after_image_url text;

-- Also ensure the audio bucket exists and has proper policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Create audio storage policies
CREATE POLICY "Allow authenticated uploads to audio bucket" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Allow public read access to audio files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'audio');

CREATE POLICY "Allow authenticated delete from audio bucket" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'audio');