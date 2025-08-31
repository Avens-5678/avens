-- Update existing Corporate & Exhibition event (need to find the correct event_type)
UPDATE events SET 
  title = 'Corporate & Exhibitions',
  description = 'Complete event infrastructure for conferences, seminars, and expos. Smart, scalable solutions for trade shows and product launches. Professional rentals and staging for brand showcases.',
  hero_subtitle = 'Where business meets brilliance',
  hero_cta_text = 'Plan Your Conference',
  cta_title = 'Ready to Transform Your Vision Into Reality?',
  cta_description = 'From boardrooms to ballrooms, we deliver precision planning and flawless execution for your corporate events.',
  cta_button_text = 'Get Corporate Quote',
  specialties = '[
    {"title": "Conferences", "description": "Professional infrastructure for knowledge sharing and business networking."},
    {"title": "Seminars", "description": "Intimate setups for focused learning and professional development."},
    {"title": "Trade Shows & Exhibitions", "description": "Large-scale expo solutions showcasing brands and innovations."},
    {"title": "Product Launches", "description": "Impactful launch events that create buzz and drive engagement."},
    {"title": "Award Ceremonies", "description": "Elegant setups for celebrating achievements and recognizing excellence."}
  ]'::jsonb,
  services = '[
    {"title": "Exhibition Design & Construction", "icon": "star"},
    {"title": "Stage & Sound Management", "icon": "star"},
    {"title": "Branding & Marketing Setup", "icon": "star"},
    {"title": "Corporate Protocol Management", "icon": "star"},
    {"title": "VIP & Delegate Coordination", "icon": "star"},
    {"title": "Transportation & Logistics", "icon": "star"},
    {"title": "End-to-End Vendor Management", "icon": "star"},
    {"title": "Audio-Visual Solutions", "icon": "star"}
  ]'::jsonb,
  process_steps = '[
    {"title": "Business Analysis", "description": "We understand your corporate objectives, target audience, and brand requirements.", "icon": "users", "order": 1},
    {"title": "Strategic Design", "description": "Our team creates layouts, branding strategies, and technical specifications.", "icon": "calendar", "order": 2},
    {"title": "Flawless Execution", "description": "Professional delivery with real-time coordination and post-event analytics.", "icon": "star", "order": 3}
  ]'::jsonb,
  process_description = 'Our corporate event process begins with understanding your business objectives, brand identity, and target audience. We collaborate with your marketing and executive teams to ensure perfect alignment with your corporate goals. Our designs prioritize professional networking, brand visibility, and seamless attendee experience.',
  url_slug = 'corporate-exhibitions'
WHERE title LIKE '%Corporate%' OR event_type LIKE '%corporate%';

-- Update Entertainment & Lifestyle Events
UPDATE events SET 
  title = 'Entertainment & Lifestyle Events',
  description = 'Immersive stages for concerts and music festivals. Premium setups for film festivals and award shows. Lighting, sound, and décor designed to wow audiences.',
  hero_subtitle = 'Lights, sound, action — the show begins',
  hero_cta_text = 'Book Concert Setup',
  cta_title = 'Ready to Set the Stage?',
  cta_description = 'Where entertainment meets flawless execution. Creating nights that people talk about for years.',
  cta_button_text = 'Plan My Festival',
  specialties = '[
    {"title": "Concerts & Music Festivals", "description": "World-class stages and sound systems for unforgettable musical experiences."},
    {"title": "Film Festivals & Award Functions", "description": "Red carpet events and prestigious award ceremonies with premium setups."}
  ]'::jsonb,
  services = '[
    {"title": "Stage & Sound Engineering", "icon": "star"},
    {"title": "Lighting & Visual Effects", "icon": "star"},
    {"title": "Backstage & Artist Coordination", "icon": "star"},
    {"title": "Red Carpet & VIP Experiences", "icon": "star"},
    {"title": "Ticketing & Entry Management", "icon": "star"},
    {"title": "Décor & Theme Setup", "icon": "star"},
    {"title": "Media & Branding Solutions", "icon": "star"},
    {"title": "Security & Crowd Flow Management", "icon": "star"}
  ]'::jsonb,
  process_steps = '[
    {"title": "Concept Creation", "description": "We brainstorm themes, performances, and technical requirements.", "icon": "users", "order": 1},
    {"title": "Event Build", "description": "We design and set up stage, sound, visuals, and ambience.", "icon": "calendar", "order": 2},
    {"title": "Showtime", "description": "Our team manages technicals, artists, and flow for a stunning show.", "icon": "star", "order": 3}
  ]'::jsonb,
  process_description = 'We brainstorm creatively to understand the theme, performance requirements, and audience. We design the stage, sound, lighting, and visuals to enhance the event. Our team coordinates artists, technicians, and vendors for seamless execution.'
WHERE event_type = 'entertainment-&-lifestyle-events';

-- Insert Sports & Outdoor Events
INSERT INTO events (
  title, event_type, description, hero_subtitle, hero_cta_text,
  cta_title, cta_description, cta_button_text,
  specialties, services, process_steps, process_description,
  url_slug, is_active
) VALUES (
  'Sports & Outdoor Events',
  'sports-outdoor-events',
  'Complete infrastructure for sporting tournaments. Outdoor event solutions built for scale and energy. Dynamic setups for cricket, football, and more.',
  'Where passion meets performance',
  'Plan My Tournament',
  'Ready to Fuel the Adrenaline?',
  'From stadiums to marathons, we deliver dynamic setups with precision and celebrate the spirit of sports.',
  'Plan My Tournament',
  '[
    {"title": "Sporting Tournaments", "description": "Cricket, Football, Badminton, and other sporting events with professional infrastructure."},
    {"title": "Marathons / Cycling Events", "description": "Outdoor endurance events with safe, organized setups for participants and spectators."}
  ]'::jsonb,
  '[
    {"title": "Sports Infrastructure Setup", "icon": "star"},
    {"title": "Outdoor Venue Management", "icon": "star"},
    {"title": "Staging & Branding Solutions", "icon": "star"},
    {"title": "Scoreboards & Technical Support", "icon": "star"},
    {"title": "Logistics & Transportation", "icon": "star"},
    {"title": "Athlete & Team Management", "icon": "star"},
    {"title": "Safety & Medical Support", "icon": "star"},
    {"title": "Live Event Coordination", "icon": "star"}
  ]'::jsonb,
  '[
    {"title": "Planning", "description": "We map out the venue, athlete requirements, and event goals.", "icon": "users", "order": 1},
    {"title": "Setup & Logistics", "description": "We install infrastructure, branding, and support facilities.", "icon": "calendar", "order": 2},
    {"title": "Execution", "description": "Our team manages live flow, safety, and crowd engagement.", "icon": "star", "order": 3}
  ]'::jsonb,
  'We assess the scale, location, and requirements of your sporting event. Our planners design custom layouts for fields, tracks, or outdoor venues, prioritizing safety and enhancing the participant experience. On the event day, our team manages infrastructure, logistics, and live coordination.',
  'sports-outdoor-events',
  true
);

-- Insert Healthcare & Medical Events
INSERT INTO events (
  title, event_type, description, hero_subtitle, hero_cta_text,
  cta_title, cta_description, cta_button_text,
  specialties, services, process_steps, process_description,
  url_slug, is_active
) VALUES (
  'Healthcare & Medical Events',
  'healthcare-medical-events',
  'Professional planning for CME programs, pharma meets, and health expos. Trusted partner for medical associations, hospitals, and pharma companies with accuracy and compliance.',
  'Precision Planning for World-Class Medical Events',
  'Plan My Medical Event',
  'Ready to Advance Healthcare Together?',
  'Where medicine, innovation, and events meet. Supporting the future of healthcare through impactful events.',
  'Plan My Medical Event',
  '[
    {"title": "Medical Conferences (CME, Pharma Events)", "description": "Professional conferences for continuing medical education and pharmaceutical industry events."},
    {"title": "Health Expos", "description": "Large-scale health awareness expos connecting healthcare providers with the community."}
  ]'::jsonb,
  '[
    {"title": "Conference & Exhibition Hall Setup", "icon": "star"},
    {"title": "Audio-Visual & Interpretation Systems", "icon": "star"},
    {"title": "Delegate Registration & Hospitality", "icon": "star"},
    {"title": "Pharma & Medical Equipment Expo Stalls", "icon": "star"},
    {"title": "Branding & Medical Awareness Campaigns", "icon": "star"},
    {"title": "Travel & Accommodation Facilitation", "icon": "star"},
    {"title": "Digital Session Streaming / Hybrid Events", "icon": "star"},
    {"title": "Compliance with Medical & Industry Standards", "icon": "star"}
  ]'::jsonb,
  '[
    {"title": "Consultation", "description": "We connect with your medical association, hospital, or pharma team to understand goals and compliance requirements.", "icon": "users", "order": 1},
    {"title": "Custom Planning", "description": "We design layouts, technical setups, and support services to meet event standards and medical protocols.", "icon": "calendar", "order": 2},
    {"title": "Execution & Support", "description": "On event day, we manage everything from delegate experience to technical accuracy, ensuring your event runs flawlessly.", "icon": "star", "order": 3}
  ]'::jsonb,
  'Our process begins with understanding the objective of the medical event — whether it is education, research sharing, product launches, or public awareness. We design the event strategy including venue setup, stall layouts, audio-visual integration, branding, medical compliance requirements, and delegate experience planning.',
  'healthcare-medical-events',
  true
);