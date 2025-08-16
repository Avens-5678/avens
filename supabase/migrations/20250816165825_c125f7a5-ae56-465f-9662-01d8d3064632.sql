-- Add album_url field to portfolio table for bulk photo uploads
ALTER TABLE public.portfolio 
ADD COLUMN album_url text;