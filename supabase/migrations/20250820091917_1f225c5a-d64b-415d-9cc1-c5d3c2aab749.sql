-- Clean up invalid PDF image URLs from services table
UPDATE services 
SET image_url = NULL 
WHERE image_url ILIKE '%.pdf';