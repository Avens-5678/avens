
-- Seed venue amenities data
UPDATE public.rentals SET amenities = ARRAY['In-house Catering', 'AC Halls', 'Parking Available', 'Valet Parking'], guest_capacity = 'large' WHERE title = 'Banquet Halls' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['Parking Available', 'DJ Allowed', 'In-house Decor'], guest_capacity = 'mega' WHERE title = 'Convention Centers' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['In-house Catering', 'In-house Decor', 'AC Halls', 'Parking Available', 'Valet Parking', 'DJ Allowed'], guest_capacity = 'mega' WHERE title = 'Destination Wedding Venues' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['Parking Available', 'DJ Allowed', 'Without Catering'], guest_capacity = 'mega' WHERE title = 'Farmhouses' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['In-house Decor', 'Parking Available', 'Valet Parking'], guest_capacity = 'large' WHERE title = 'Heritage Venues' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['In-house Catering', 'AC Halls', 'Parking Available', 'Valet Parking', 'In-house Decor'], guest_capacity = 'large' WHERE title = 'Hotels & Resorts' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['In-house Catering', 'AC Halls', 'Parking Available'], guest_capacity = 'medium' WHERE title = 'Kalyana Mandapams' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['Parking Available', 'DJ Allowed', 'Without Catering'], guest_capacity = 'mega' WHERE title = 'Marriage Gardens & Lawns' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['DJ Allowed', 'Parking Available'], guest_capacity = 'large' WHERE title = 'Outdoor Venues' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['AC Halls', 'DJ Allowed', 'Parking Available'], guest_capacity = 'small' WHERE title = 'Party Halls' AND service_type = 'venue';
UPDATE public.rentals SET amenities = ARRAY['DJ Allowed', 'Parking Available'], guest_capacity = 'medium' WHERE title = 'Rooftop Venues' AND service_type = 'venue';

-- Seed crew experience levels
UPDATE public.rentals SET experience_level = 'expert' WHERE title = 'Photographers' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'senior' WHERE title = 'Videographers' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'expert' WHERE title = 'Event Managers' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'senior' WHERE title = 'Decorators' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'mid' WHERE title = 'Makeup Artists' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'senior' WHERE title = 'Caterers' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'mid' WHERE title = 'DJs & Music' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'mid' WHERE title = 'Choreographers' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'senior' WHERE title = 'Florists' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'mid' WHERE title = 'Mehendi Artists' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'junior' WHERE title = 'Anchors & MCs' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'expert' WHERE title = 'Wedding Planners' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'mid' WHERE title = 'Pandits & Priests' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'junior' WHERE title = 'Bartenders' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'junior' WHERE title = 'Invitation Designers' AND service_type = 'crew';
UPDATE public.rentals SET experience_level = 'mid' WHERE title = 'Wedding Entertainment' AND service_type = 'crew';

-- Seed promo banners for Venues
INSERT INTO public.promo_banners (title, subtitle, cta_text, gradient_from, gradient_to, service_type, display_order, is_active, linked_rental_ids)
VALUES
  ('Dream Venues Await', 'Find the perfect venue for your special day — Banquet Halls, Farmhouses & more', 'Explore Venues', '#0f766e', '#14b8a6', 'venue', 1, true,
    ARRAY(SELECT id FROM public.rentals WHERE service_type = 'venue' AND title IN ('Banquet Halls', 'Hotels & Resorts', 'Farmhouses') LIMIT 3)),
  ('Grand Celebrations Start Here', 'Heritage venues, rooftop spaces & outdoor paradises for unforgettable events', 'View Premium Venues', '#7c2d12', '#ea580c', 'venue', 2, true,
    ARRAY(SELECT id FROM public.rentals WHERE service_type = 'venue' AND title IN ('Heritage Venues', 'Rooftop Venues', 'Outdoor Venues') LIMIT 3));

-- Seed promo banners for Crew Hub
INSERT INTO public.promo_banners (title, subtitle, cta_text, gradient_from, gradient_to, service_type, display_order, is_active, linked_rental_ids)
VALUES
  ('Top-Rated Event Crew', 'Hire expert photographers, decorators & planners for flawless execution', 'Browse Crew', '#4338ca', '#818cf8', 'crew', 1, true,
    ARRAY(SELECT id FROM public.rentals WHERE service_type = 'crew' AND title IN ('Photographers', 'Decorators', 'Event Managers') LIMIT 3)),
  ('Music, Dance & Entertainment', 'DJs, choreographers & live entertainment to keep the party going', 'Find Entertainment', '#9d174d', '#f472b6', 'crew', 2, true,
    ARRAY(SELECT id FROM public.rentals WHERE service_type = 'crew' AND title IN ('DJs & Music', 'Choreographers', 'Wedding Entertainment') LIMIT 3));
