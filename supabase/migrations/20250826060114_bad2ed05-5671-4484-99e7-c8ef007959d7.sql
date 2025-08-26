-- Add hero text fields to hero_banners table
ALTER TABLE hero_banners 
ADD COLUMN hero_text_1 TEXT DEFAULT 'Extraordinary',
ADD COLUMN hero_text_2 TEXT DEFAULT 'Experiences';