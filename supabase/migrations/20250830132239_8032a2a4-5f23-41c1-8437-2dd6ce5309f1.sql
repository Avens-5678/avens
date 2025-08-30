-- Add CTA section fields to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS cta_title text DEFAULT 'Ready to Create Something Amazing Together?',
ADD COLUMN IF NOT EXISTS cta_description text DEFAULT 'Let''s discuss your vision and create an unforgettable experience that exceeds your expectations.',
ADD COLUMN IF NOT EXISTS cta_button_text text DEFAULT 'Book a Consultation';