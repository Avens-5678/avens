-- Add image_url column to rentals table for equipment images
ALTER TABLE rentals ADD COLUMN image_url TEXT;

-- Add rental_title column to form_submissions for better admin display
ALTER TABLE form_submissions ADD COLUMN rental_title TEXT;