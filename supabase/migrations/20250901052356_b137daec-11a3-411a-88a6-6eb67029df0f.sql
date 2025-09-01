-- Update events with new hero images
UPDATE events SET 
  hero_image_url = '/src/assets/corporate-exhibitions-hero.jpg'
WHERE event_type = 'corporate-exhibitions';

UPDATE events SET 
  hero_image_url = '/src/assets/entertainment-lifestyle-hero.jpg'
WHERE event_type = 'entertainment-&-lifestyle-events';

UPDATE events SET 
  hero_image_url = '/src/assets/sports-outdoor-hero.jpg'
WHERE event_type = 'sports-outdoor-events';

UPDATE events SET 
  hero_image_url = '/src/assets/healthcare-medical-hero.jpg'
WHERE event_type = 'healthcare-medical-events';

-- Also update existing events hero images
UPDATE events SET 
  hero_image_url = '/src/assets/government-events-hero.jpg'
WHERE event_type = 'government-&-public-events';

UPDATE events SET 
  hero_image_url = '/src/assets/wedding-events-hero.jpg'
WHERE event_type = 'social-&-personal-events';