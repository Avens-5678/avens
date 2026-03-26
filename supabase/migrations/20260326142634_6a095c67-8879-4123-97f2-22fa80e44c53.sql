-- Seed venue categories
INSERT INTO public.rentals (title, short_description, description, service_type, categories, is_active, show_on_home)
VALUES
  ('Banquet Halls', 'Premium banquet halls for grand celebrations', 'Spacious and elegant banquet halls perfect for weddings, receptions, and corporate galas.', 'venue', ARRAY['Banquet Halls'], true, true),
  ('Farmhouses', 'Scenic farmhouses for outdoor events', 'Beautiful farmhouse venues surrounded by nature, ideal for destination weddings and parties.', 'venue', ARRAY['Farmhouses'], true, true),
  ('Hotels & Resorts', 'Luxury hotel venues with full amenities', 'Premium hotel and resort venues offering world-class hospitality and event spaces.', 'venue', ARRAY['Hotels & Resorts'], true, true),
  ('Party Halls', 'Vibrant party halls for all occasions', 'Fun and versatile party halls for birthdays, anniversaries, and celebrations.', 'venue', ARRAY['Party Halls'], true, true),
  ('Outdoor Venues', 'Open-air venues for memorable events', 'Stunning outdoor venues including gardens, lawns, and terraces for open-air celebrations.', 'venue', ARRAY['Outdoor Venues'], true, true),
  ('Convention Centers', 'Large-scale convention and expo spaces', 'Professional convention centers for conferences, exhibitions, and large-scale corporate events.', 'venue', ARRAY['Convention Centers'], true, true),
  ('Heritage Venues', 'Historic palaces and heritage properties', 'Magnificent heritage venues including palaces and forts for royal-themed celebrations.', 'venue', ARRAY['Heritage Venues'], true, true),
  ('Rooftop Venues', 'Skyline rooftop event spaces', 'Trendy rooftop venues with stunning city views for cocktail parties and intimate events.', 'venue', ARRAY['Rooftop Venues'], true, true),

-- Seed crew categories
  ('Photographers', 'Professional event photographers', 'Skilled photographers capturing every precious moment of your special events with artistic flair.', 'crew', ARRAY['Photographers'], true, true),
  ('Decorators', 'Creative event decorators and stylists', 'Expert decorators transforming venues into stunning visual experiences with themes and florals.', 'crew', ARRAY['Decorators'], true, true),
  ('Makeup Artists', 'Professional bridal and event makeup', 'Top makeup artists offering bridal, party, and editorial makeup services for your special day.', 'crew', ARRAY['Makeup Artists'], true, true),
  ('Caterers', 'Premium catering services', 'Professional caterers offering multi-cuisine menus for weddings, corporate events, and parties.', 'crew', ARRAY['Caterers'], true, true),
  ('DJs & Music', 'DJs and live music entertainment', 'Talented DJs and live musicians to set the perfect mood for your celebrations.', 'crew', ARRAY['DJs & Music'], true, true),
  ('Choreographers', 'Dance choreographers for events', 'Professional choreographers for sangeet, flash mobs, and wedding dance performances.', 'crew', ARRAY['Choreographers'], true, true),
  ('Event Managers', 'End-to-end event management', 'Experienced event managers handling planning, coordination, and flawless execution.', 'crew', ARRAY['Event Managers'], true, true),
  ('Anchors & MCs', 'Professional event hosts and emcees', 'Charismatic anchors and MCs to host and energize your events with professionalism.', 'crew', ARRAY['Anchors & MCs'], true, true),
  ('Mehendi Artists', 'Traditional and modern mehendi designs', 'Skilled mehendi artists offering intricate bridal and party henna designs.', 'crew', ARRAY['Mehendi Artists'], true, true),
  ('Florists', 'Floral arrangements and décor', 'Creative florists crafting beautiful floral arrangements for weddings and events.', 'crew', ARRAY['Florists'], true, true),
  ('Videographers', 'Cinematic event videography', 'Professional videographers creating cinematic films and highlight reels of your events.', 'crew', ARRAY['Videographers'], true, true)
ON CONFLICT DO NOTHING;