-- Add image_url column to services table
ALTER TABLE public.services 
ADD COLUMN image_url text;

-- Add comment for clarity
COMMENT ON COLUMN public.services.image_url IS 'URL of the service image displayed on homepage';