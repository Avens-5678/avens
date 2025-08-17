-- Add new columns to events table for rich content
ALTER TABLE public.events 
ADD COLUMN specialties JSONB DEFAULT '[]'::jsonb,
ADD COLUMN services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN process_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN hero_subtitle TEXT,
ADD COLUMN hero_cta_text TEXT DEFAULT 'Book a Consultation',
ADD COLUMN what_we_do_title TEXT DEFAULT 'What We Do',
ADD COLUMN services_section_title TEXT DEFAULT 'Our Services',
ADD COLUMN url_slug TEXT,
ADD COLUMN meta_description TEXT,
ADD COLUMN default_portfolio_tags TEXT[] DEFAULT '{}';

-- Create unique constraint on url_slug
ALTER TABLE public.events ADD CONSTRAINT events_url_slug_unique UNIQUE (url_slug);

-- Create trigger to auto-generate url_slug from event_type if not provided
CREATE OR REPLACE FUNCTION generate_event_url_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.url_slug IS NULL OR NEW.url_slug = '' THEN
    NEW.url_slug = NEW.event_type::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_event_url_slug
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION generate_event_url_slug();