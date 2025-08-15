-- Create enum for event types
CREATE TYPE event_type AS ENUM ('wedding', 'corporate', 'birthday', 'anniversary', 'social', 'other');

-- Create hero_banners table for homepage carousel
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  event_type event_type NOT NULL,
  button_text TEXT DEFAULT 'Learn More',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  event_type event_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rentals table
CREATE TABLE public.rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  price_range TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trusted_clients table for logos
CREATE TABLE public.trusted_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_achievements table
CREATE TABLE public.news_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  short_content TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table for detailed event pages
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type event_type NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  process_description TEXT NOT NULL,
  hero_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio table for gallery images
CREATE TABLE public.portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_before_after BOOLEAN DEFAULT false,
  is_before BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create awards table for services page
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  year INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create about_content table
CREATE TABLE public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_name TEXT NOT NULL,
  founder_image_url TEXT,
  founder_note TEXT NOT NULL,
  founder_quote TEXT NOT NULL,
  mission_statement TEXT NOT NULL,
  vision_statement TEXT NOT NULL,
  full_about_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  form_type TEXT NOT NULL, -- 'inquiry', 'contact', 'rental'
  event_type event_type,
  rental_id UUID REFERENCES public.rentals(id),
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'converted', 'closed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required for viewing)
CREATE POLICY "Allow public read access" ON public.hero_banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.rentals FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.trusted_clients FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.news_achievements FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.portfolio FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.awards FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.about_content FOR SELECT USING (true);

-- Allow anyone to submit forms
CREATE POLICY "Allow public form submissions" ON public.form_submissions FOR INSERT WITH CHECK (true);

-- Admin access policies (will add auth later)
CREATE POLICY "Admin full access hero_banners" ON public.hero_banners FOR ALL USING (true);
CREATE POLICY "Admin full access services" ON public.services FOR ALL USING (true);
CREATE POLICY "Admin full access rentals" ON public.rentals FOR ALL USING (true);
CREATE POLICY "Admin full access trusted_clients" ON public.trusted_clients FOR ALL USING (true);
CREATE POLICY "Admin full access news_achievements" ON public.news_achievements FOR ALL USING (true);
CREATE POLICY "Admin full access events" ON public.events FOR ALL USING (true);
CREATE POLICY "Admin full access portfolio" ON public.portfolio FOR ALL USING (true);
CREATE POLICY "Admin full access awards" ON public.awards FOR ALL USING (true);
CREATE POLICY "Admin full access about_content" ON public.about_content FOR ALL USING (true);
CREATE POLICY "Admin full access form_submissions" ON public.form_submissions FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_hero_banners_display_order ON public.hero_banners(display_order);
CREATE INDEX idx_services_event_type ON public.services(event_type);
CREATE INDEX idx_portfolio_event_id ON public.portfolio(event_id);
CREATE INDEX idx_form_submissions_created_at ON public.form_submissions(created_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hero_banners_updated_at BEFORE UPDATE ON public.hero_banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trusted_clients_updated_at BEFORE UPDATE ON public.trusted_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_news_achievements_updated_at BEFORE UPDATE ON public.news_achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_awards_updated_at BEFORE UPDATE ON public.awards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON public.about_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_form_submissions_updated_at BEFORE UPDATE ON public.form_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();