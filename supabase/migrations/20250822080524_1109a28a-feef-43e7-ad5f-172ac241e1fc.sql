-- Add image_urls column to rentals table for multiple images
ALTER TABLE public.rentals 
ADD COLUMN image_urls TEXT[] DEFAULT '{}';

-- Update existing rentals to include their current image_url in the new array
UPDATE public.rentals 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN ARRAY[image_url] 
  ELSE '{}' 
END;