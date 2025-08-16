-- Add tag field to portfolio table for categorization and filtering
ALTER TABLE public.portfolio 
ADD COLUMN tag TEXT;