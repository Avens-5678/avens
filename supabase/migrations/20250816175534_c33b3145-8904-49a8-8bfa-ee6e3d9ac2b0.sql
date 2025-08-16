-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);

-- Create policies for audio storage
CREATE POLICY "Public can view audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio');

CREATE POLICY "Admins can upload audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio' AND is_current_user_admin());

CREATE POLICY "Admins can update audio files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'audio' AND is_current_user_admin());

CREATE POLICY "Admins can delete audio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio' AND is_current_user_admin());

-- Create a table to track the current background audio file
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  background_audio_url TEXT,
  background_audio_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site settings
CREATE POLICY "Allow public read access" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (is_current_user_admin());

-- Insert default settings
INSERT INTO public.site_settings (background_audio_enabled) VALUES (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();