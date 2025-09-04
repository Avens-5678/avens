-- Update corporate-exhibitions hero image path
UPDATE events 
SET hero_image_url = '/src/assets/corporate-exhibitions-hero.jpg'
WHERE event_type = 'corporate-exhibitions';