-- Add missing sample data that doesn't already exist

-- Insert sample rentals (if not already present)
INSERT INTO rentals (title, description, short_description, price_range)
SELECT * FROM (VALUES
  ('Premium Table Settings', 'Elegant table settings including fine china, crystal glassware, and silverware for sophisticated dining experiences.', 'Complete elegant table setting packages', '$15-25 per setting'),
  ('Luxury Linens', 'High-quality tablecloths, napkins, and chair covers in various colors and fabrics to match your event theme.', 'Premium quality linens and fabric accessories', '$8-20 per piece'),
  ('Sophisticated Lighting', 'Professional lighting equipment including string lights, uplighting, and ambient lighting solutions.', 'Professional lighting equipment and installation', '$100-500 per event'),
  ('Sound & Entertainment', 'High-quality sound systems, microphones, and entertainment equipment for speeches and music.', 'Professional audio and entertainment systems', '$200-800 per event'),
  ('Elegant Furniture', 'Stylish chairs, tables, and lounge furniture to create comfortable and beautiful event spaces.', 'Premium event furniture and seating', '$25-75 per piece'),
  ('Decorative Elements', 'Beautiful centerpieces, floral arrangements, and decorative accessories to enhance your event ambiance.', 'Custom decorative pieces and arrangements', '$50-300 per arrangement'),
  ('Bar Services', 'Complete bar setup including glassware, bar tools, and professional bartending services.', 'Professional bar setup and service', '$300-1000 per event'),
  ('Photography Props', 'Fun and elegant photography props, backdrops, and photo booth accessories for memorable pictures.', 'Photography props and photo booth setups', '$150-400 per event')
) AS v(title, description, short_description, price_range)
WHERE NOT EXISTS (SELECT 1 FROM rentals WHERE rentals.title = v.title);

-- Insert sample trusted clients (if not already present)
INSERT INTO trusted_clients (name, logo_url)
SELECT * FROM (VALUES
  ('Elite Hospitality Group', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop'),
  ('Metropolitan Hotels', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=100&fit=crop'),
  ('Prestige Venues', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=100&fit=crop'),
  ('Luxury Resorts International', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&h=100&fit=crop'),
  ('Grand Event Centers', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=100&fit=crop'),
  ('Premier Catering Co.', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=100&fit=crop')
) AS v(name, logo_url)
WHERE NOT EXISTS (SELECT 1 FROM trusted_clients WHERE trusted_clients.name = v.name);

-- Insert sample awards (if not already present)
INSERT INTO awards (title, description, year, logo_url)
SELECT * FROM (VALUES
  ('Best Event Planner 2023', 'Recognized for excellence in event planning and customer satisfaction by the National Event Planning Association.', 2023, 'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=100&h=100&fit=crop'),
  ('Wedding Planner of the Year', 'Awarded by Bridal Magazine for outstanding wedding planning services and innovative design concepts.', 2023, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'),
  ('Customer Service Excellence', 'Honored for exceptional customer service and client satisfaction ratings consistently above 95%.', 2022, 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=100&h=100&fit=crop'),
  ('Innovation in Events Award', 'Recognized for creative event design and implementation of new event technology solutions.', 2022, 'https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=100&h=100&fit=crop')
) AS v(title, description, year, logo_url)
WHERE NOT EXISTS (SELECT 1 FROM awards WHERE awards.title = v.title);

-- Insert sample news and achievements (if not already present)
INSERT INTO news_achievements (title, short_content, content, image_url)
SELECT * FROM (VALUES
  ('Featured in Event Planning Magazine', 'Our latest wedding project was featured as the cover story in this month''s Event Planning Magazine.', 'We are thrilled to announce that our recent luxury wedding project at the Grand Ballroom has been selected as the cover story for Event Planning Magazine''s special edition on innovative wedding design. The feature highlights our unique approach to blending traditional elegance with modern sophistication, showcasing how we transformed the venue into a fairytale setting that perfectly captured the couple''s love story.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop'),
  ('Expanded Service Offerings', 'We''ve added new corporate event services to better serve our business clients.', 'In response to growing demand from our corporate clients, we have expanded our service offerings to include comprehensive corporate event management. Our new services cover everything from large-scale conferences and product launches to intimate executive retreats and team-building events. This expansion allows us to provide end-to-end event solutions for businesses of all sizes.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop'),
  ('Partnership with Luxury Venues', 'New partnerships with premium venues across the city enhance our service capabilities.', 'We are excited to announce strategic partnerships with five of the city''s most prestigious venues, including the Historic Grand Hotel, Riverside Convention Center, and the Art Museum Event Spaces. These partnerships provide our clients with exclusive access to premium locations and preferred pricing, further enhancing our ability to create extraordinary events in spectacular settings.', 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&h=400&fit=crop'),
  ('Sustainability Initiative Launch', 'Introducing eco-friendly event planning options for environmentally conscious clients.', 'As part of our commitment to environmental responsibility, we have launched our Green Events initiative, offering sustainable event planning options that minimize environmental impact without compromising on quality or elegance. Our eco-friendly services include sustainable decor, locally-sourced catering, digital invitations, and waste reduction strategies.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop')
) AS v(title, short_content, content, image_url)
WHERE NOT EXISTS (SELECT 1 FROM news_achievements WHERE news_achievements.title = v.title);

-- Insert sample hero banners with proper enum casting
INSERT INTO hero_banners (title, subtitle, image_url, event_type, button_text)
VALUES
  ('Creating Unforgettable Moments', 'Premium event management and rental services for your special occasions', 'https://images.unsplash.com/photo-1520637836862-4d197d17c86a?w=1920&h=1080&fit=crop', 'wedding'::event_type, 'Explore Weddings'),
  ('Perfect Corporate Events', 'Professional event management that elevates your business image', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=1080&fit=crop', 'corporate'::event_type, 'Learn More'),
  ('Magical Celebrations', 'Making every birthday and anniversary truly special', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920&h=1080&fit=crop', 'birthday'::event_type, 'Plan Your Party')
ON CONFLICT (title) DO NOTHING;

-- Insert sample portfolio items linked to existing events
INSERT INTO portfolio (title, image_url, event_id, is_before_after, is_before) 
SELECT 
  'Beautiful Wedding Ceremony Setup',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop',
  e.id,
  false,
  false
FROM events e WHERE e.event_type = 'wedding' 
AND NOT EXISTS (
  SELECT 1 FROM portfolio p 
  WHERE p.event_id = e.id AND p.title = 'Beautiful Wedding Ceremony Setup'
)
UNION ALL
SELECT 
  'Elegant Reception Decor',
  'https://images.unsplash.com/photo-1519167758481-83f29c53b00c?w=800&h=600&fit=crop',
  e.id,
  false,
  false
FROM events e WHERE e.event_type = 'wedding'
AND NOT EXISTS (
  SELECT 1 FROM portfolio p 
  WHERE p.event_id = e.id AND p.title = 'Elegant Reception Decor'
)
UNION ALL
SELECT 
  'Corporate Conference Setup',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
  e.id,
  false,
  false
FROM events e WHERE e.event_type = 'corporate'
AND NOT EXISTS (
  SELECT 1 FROM portfolio p 
  WHERE p.event_id = e.id AND p.title = 'Corporate Conference Setup'
)
UNION ALL
SELECT 
  'Birthday Party Celebration',
  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop',
  e.id,
  false,
  false
FROM events e WHERE e.event_type = 'birthday'
AND NOT EXISTS (
  SELECT 1 FROM portfolio p 
  WHERE p.event_id = e.id AND p.title = 'Birthday Party Celebration'
);