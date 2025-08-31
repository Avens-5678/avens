-- Update events table with comprehensive Avens content
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
  process_description = 'Our corporate event process begins with understanding your business objectives, brand identity, and target audience. We collaborate with your marketing and executive teams to ensure perfect alignment with your corporate goals. Our designs prioritize professional networking, brand visibility, and seamless attendee experience.'
WHERE event_type = 'corporate-events';

UPDATE events SET 
  title = 'Government & Public Events',
  description = 'Trusted partner for national and state exhibitions. Seamless delivery of mega events across India. Precision infrastructure for rallies, summits, and conventions.',
  hero_subtitle = 'Grand stages for national pride',
  hero_cta_text = 'Partner With Us',
  cta_title = 'Ready to Serve the Nation Together?',
  cta_description = 'Trusted by ministries, loved by the people. Large-scale events, simplified with precision.',
  cta_button_text = 'Request Government Event Quote',
  specialties = '[
    {"title": "National & State-Level Exhibitions", "description": "Showcasing cultural, economic, and technological achievements at national and state levels."},
    {"title": "Public Expositions", "description": "Dynamic events like Auto Expo, Agri Expo, and Property Shows gathering businesses and public."},
    {"title": "Political Rallies & Campaigns", "description": "Powerful gatherings designed to engage citizens and share political visions."},
    {"title": "Defense & Aero Shows", "description": "Premier events highlighting advancements in defense and aerospace technologies."}
  ]'::jsonb,
  services = '[
    {"title": "Exhibition Design & Construction", "icon": "star"},
    {"title": "Stage & Sound Management", "icon": "star"},
    {"title": "Branding & Public Awareness Setup", "icon": "star"},
    {"title": "Government Protocol Compliance", "icon": "star"},
    {"title": "Crowd & Safety Management", "icon": "star"},
    {"title": "VIP & Delegate Coordination", "icon": "star"},
    {"title": "Transportation & Logistics", "icon": "star"},
    {"title": "End-to-End Vendor Management", "icon": "star"}
  ]'::jsonb,
  process_steps = '[
    {"title": "Requirement Gathering", "description": "We align with government departments and stakeholders to understand objectives, compliance, and scale.", "icon": "users", "order": 1},
    {"title": "Strategic Planning", "description": "We prepare designs, infrastructure layouts, and logistics plans tailored to the event scope.", "icon": "calendar", "order": 2},
    {"title": "Execution & Reporting", "description": "Our team ensures professional delivery on ground and provides post-event reports for future planning.", "icon": "star", "order": 3}
  ]'::jsonb
WHERE event_type = 'government-&-public-events';

UPDATE events SET 
  title = 'Social & Personal Events',
  description = 'Elegant décor and rentals for dream weddings. Personalized setups for engagements and anniversaries. Stylish solutions for farmhouse and private parties.',
  hero_subtitle = 'Because your moments deserve magic',
  hero_cta_text = 'Book Your Celebration',
  cta_title = 'Ready to Make Your Day Special?',
  cta_description = 'Turning celebrations into timeless memories with love, laughter, and flawless décor.',
  cta_button_text = 'Plan My Wedding',
  specialties = '[
    {"title": "Weddings", "description": "Dream wedding setups with elegant décor, from intimate ceremonies to grand celebrations."},
    {"title": "Engagements", "description": "Romantic engagement setups that mark the beginning of your beautiful journey together."},
    {"title": "Private Parties", "description": "House parties and farmhouse events designed for intimate celebrations with family and friends."}
  ]'::jsonb,
  services = '[
    {"title": "Wedding Planning & Coordination", "icon": "star"},
    {"title": "Thematic Décor & Styling", "icon": "star"},
    {"title": "Venue & Catering Arrangements", "icon": "star"},
    {"title": "Entertainment & Music Setup", "icon": "star"},
    {"title": "Floral & Lighting Design", "icon": "star"},
    {"title": "Photography & Videography Management", "icon": "star"},
    {"title": "Guest Management & Invitations", "icon": "star"},
    {"title": "Luxury Rentals (Furniture, Tents, Lounges)", "icon": "star"}
  ]'::jsonb,
  process_steps = '[
    {"title": "Discovery", "description": "We meet to learn about your preferences, style, and event expectations.", "icon": "users", "order": 1},
    {"title": "Designing the Dream", "description": "Our creative team presents décor, theme, and event flow options tailored to you.", "icon": "calendar", "order": 2},
    {"title": "The Big Day", "description": "We bring everything together with flawless execution so you can enjoy stress-free moments.", "icon": "star", "order": 3}
  ]'::jsonb
WHERE event_type = 'social-&-personal-events';

-- Insert Entertainment & Lifestyle Events
INSERT INTO events (
  title, event_type, description, hero_subtitle, hero_cta_text, 
  cta_title, cta_description, cta_button_text,
  specialties, services, process_steps, process_description,
  url_slug, is_active
) VALUES (
  'Entertainment & Lifestyle Events',
  'entertainment-&-lifestyle-events',
  'Immersive stages for concerts and music festivals. Premium setups for film festivals and award shows. Lighting, sound, and décor designed to wow audiences.',
  'Lights, sound, action — the show begins',
  'Book Concert Setup',
  'Ready to Set the Stage?',
  'Where entertainment meets flawless execution. Creating nights that people talk about for years.',
  'Plan My Festival',
  '[
    {"title": "Concerts & Music Festivals", "description": "World-class stages and sound systems for unforgettable musical experiences."},
    {"title": "Film Festivals & Award Functions", "description": "Red carpet events and prestigious award ceremonies with premium setups."}
  ]'::jsonb,
  '[
    {"title": "Stage & Sound Engineering", "icon": "star"},
    {"title": "Lighting & Visual Effects", "icon": "star"},
    {"title": "Backstage & Artist Coordination", "icon": "star"},
    {"title": "Red Carpet & VIP Experiences", "icon": "star"},
    {"title": "Ticketing & Entry Management", "icon": "star"},
    {"title": "Décor & Theme Setup", "icon": "star"},
    {"title": "Media & Branding Solutions", "icon": "star"},
    {"title": "Security & Crowd Flow Management", "icon": "star"}
  ]'::jsonb,
  '[
    {"title": "Concept Creation", "description": "We brainstorm themes, performances, and technical requirements.", "icon": "users", "order": 1},
    {"title": "Event Build", "description": "We design and set up stage, sound, visuals, and ambience.", "icon": "calendar", "order": 2},
    {"title": "Showtime", "description": "Our team manages technicals, artists, and flow for a stunning show.", "icon": "star", "order": 3}
  ]'::jsonb,
  'We brainstorm creatively to understand the theme, performance requirements, and audience. We design the stage, sound, lighting, and visuals to enhance the event. Our team coordinates artists, technicians, and vendors for seamless execution.',
  'entertainment-&-lifestyle-events',
  true
);

-- Insert Sports & Outdoor Events
INSERT INTO events (
  title, event_type, description, hero_subtitle, hero_cta_text,
  cta_title, cta_description, cta_button_text,
  specialties, services, process_steps, process_description,
  url_slug, is_active
) VALUES (
  'Sports & Outdoor Events',
  'sports-&-outdoor-events',
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
  'sports-&-outdoor-events',
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
  'healthcare-&-medical-events',
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
  'healthcare-&-medical-events',
  true
);