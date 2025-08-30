-- Add new fields to events table for hero section content
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS hero_title text,
ADD COLUMN IF NOT EXISTS hero_description text;