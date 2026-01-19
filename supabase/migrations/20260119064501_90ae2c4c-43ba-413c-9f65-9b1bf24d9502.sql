-- Insert all event types with comprehensive content for Avens Expositions

-- 1. Corporate & Exhibitions
INSERT INTO public.events (
  event_type, title, description, process_description,
  hero_title, hero_subtitle, hero_description, hero_cta_text,
  hero_image_url, url_slug, meta_description,
  specialties, services, process_steps,
  cta_title, cta_description, cta_button_text,
  default_portfolio_tags, what_we_do_title, services_section_title,
  is_active
) VALUES (
  'corporate-exhibitions',
  'Corporate & Exhibitions',
  'We specialize in creating impactful corporate events and exhibitions that drive ROI, enhance brand visibility, and create meaningful connections. From intimate seminars to large-scale trade shows, we deliver excellence.',
  'Our proven 4-step process ensures flawless execution of every corporate event, from initial concept to post-event analytics.',
  'Elevate Your Brand',
  'Corporate Events & Exhibitions',
  'Transform your corporate vision into reality with Avens. We create powerful experiences that engage, inspire, and deliver measurable results for your business.',
  'Plan Your Event',
  '/src/assets/corporate-exhibitions-hero.jpg',
  'corporate-exhibitions',
  'Premium corporate event management and exhibition services by Avens. Conferences, trade shows, product launches, and more.',
  '[{"title": "Conferences & Seminars", "description": "Professionally managed corporate conferences with cutting-edge AV, seamless logistics, and engaging formats.", "imageUrl": "/src/assets/corporate-exhibitions-hero.jpg"}, {"title": "Trade Shows", "description": "Eye-catching booth designs and complete exhibition management that attracts and converts visitors.", "imageUrl": "/src/assets/corporate-exhibitions-hero.jpg"}, {"title": "Product Launches", "description": "Create buzz and excitement with memorable product launch events that captivate your audience.", "imageUrl": "/src/assets/corporate-exhibitions-hero.jpg"}, {"title": "Award Ceremonies", "description": "Elegant and professionally executed award ceremonies that celebrate achievements with style.", "imageUrl": "/src/assets/corporate-exhibitions-hero.jpg"}]',
  '[{"title": "Venue Selection & Management", "description": "Strategic venue sourcing and complete management"}, {"title": "AV & Technical Production", "description": "State-of-the-art audio-visual solutions"}, {"title": "Branding & Design", "description": "Custom graphics, signage, and branded environments"}, {"title": "Catering & Hospitality", "description": "Premium catering and guest services"}, {"title": "Speaker Management", "description": "Coordination of keynotes and presentations"}, {"title": "Post-Event Analytics", "description": "Comprehensive ROI reporting and insights"}]',
  '[{"step": 1, "title": "Discovery & Strategy", "description": "We understand your objectives, audience, and vision to create a tailored event strategy."}, {"step": 2, "title": "Creative Design", "description": "Our team develops compelling concepts, themes, and visual designs for your event."}, {"step": 3, "title": "Execution Excellence", "description": "Flawless on-ground execution with dedicated project managers and technical teams."}, {"step": 4, "title": "Analysis & Follow-up", "description": "Post-event analysis, attendee feedback, and ROI measurement for continuous improvement."}]',
  'Ready to Create an Impactful Corporate Event?',
  'Let''s discuss your vision and create a corporate experience that achieves your business objectives and exceeds expectations.',
  'Get a Quote',
  ARRAY['conference', 'seminar', 'trade-show', 'product-launch', 'award-ceremony', 'corporate'],
  'What We Specialize In',
  'Our Corporate Services',
  true
),

-- 2. Government & Public Events
(
  'government-events',
  'Government & Public Events',
  'Avens is trusted by government bodies across India for organizing large-scale public events, national expos, and official ceremonies with protocol compliance and impeccable execution.',
  'Our systematic approach ensures compliance, safety, and spectacular delivery for government and public events of any scale.',
  'Nation-Scale Events',
  'Government & Public Events',
  'Partner with India''s most trusted event management company for government functions, national exhibitions, and public ceremonies.',
  'Discuss Your Project',
  '/src/assets/government-events-hero.jpg',
  'government-events',
  'Government event management services by Avens. National expos, political rallies, aero shows, and official ceremonies.',
  '[{"title": "National & State Expos", "description": "Large-scale exhibitions showcasing innovation, industry, and cultural heritage with world-class infrastructure.", "imageUrl": "/src/assets/government-events-hero.jpg"}, {"title": "Agricultural Shows", "description": "Comprehensive agri-expos connecting farmers with technology, markets, and government schemes.", "imageUrl": "/src/assets/government-events-hero.jpg"}, {"title": "Aero Shows & Defense Expos", "description": "High-security events showcasing aerospace and defense capabilities with precision logistics.", "imageUrl": "/src/assets/government-events-hero.jpg"}, {"title": "Official Ceremonies", "description": "Protocol-compliant government ceremonies including inaugurations, foundation laying, and award functions.", "imageUrl": "/src/assets/government-events-hero.jpg"}]',
  '[{"title": "Protocol Management", "description": "Complete protocol compliance for VVIPs and dignitaries"}, {"title": "Security Coordination", "description": "Coordination with security agencies for safe events"}, {"title": "Crowd Management", "description": "Expert crowd control for large gatherings"}, {"title": "Mega Structures", "description": "Temporary pavilions and exhibition halls"}, {"title": "Media Management", "description": "Press coordination and live broadcasting"}, {"title": "Logistics & Operations", "description": "End-to-end event logistics and operations"}]',
  '[{"step": 1, "title": "Requirement Analysis", "description": "Understanding government objectives, compliance requirements, and event scope."}, {"step": 2, "title": "Planning & Approvals", "description": "Comprehensive planning with all necessary government approvals and clearances."}, {"step": 3, "title": "Infrastructure Setup", "description": "Deployment of mega structures, utilities, and technical infrastructure."}, {"step": 4, "title": "Event Execution", "description": "Seamless execution with real-time coordination and contingency management."}]',
  'Planning a Government Event?',
  'Connect with our government events team to discuss your requirements and explore how we can deliver a successful event.',
  'Contact Us',
  ARRAY['expo', 'government', 'public-event', 'inauguration', 'national-event', 'agriculture'],
  'Our Expertise',
  'Government Event Services',
  true
),

-- 3. Wedding & Social Events
(
  'wedding-events',
  'Wedding & Social Events',
  'Create the wedding of your dreams with Avens. We bring luxury, elegance, and flawless execution to every celebration, making your special day truly unforgettable.',
  'From intimate ceremonies to grand celebrations, our wedding planning process ensures every moment is perfectly orchestrated.',
  'Dream Weddings',
  'Crafted With Love',
  'Your love story deserves a magnificent celebration. Let Avens create a wedding experience that reflects your unique journey and exceeds your wildest dreams.',
  'Plan Your Wedding',
  '/src/assets/wedding-events-hero.jpg',
  'wedding-events',
  'Luxury wedding planning and event management by Avens. Destination weddings, traditional ceremonies, and grand receptions.',
  '[{"title": "Traditional Ceremonies", "description": "Authentic traditional weddings with cultural richness, elaborate rituals, and timeless elegance.", "imageUrl": "/src/assets/wedding-events-hero.jpg"}, {"title": "Destination Weddings", "description": "Breathtaking destination weddings at exotic locations with complete travel and hospitality management.", "imageUrl": "/src/assets/wedding-events-hero.jpg"}, {"title": "Grand Receptions", "description": "Spectacular reception events with stunning decor, entertainment, and world-class catering.", "imageUrl": "/src/assets/wedding-events-hero.jpg"}, {"title": "Intimate Celebrations", "description": "Elegant intimate gatherings with personalized touches and attention to every detail.", "imageUrl": "/src/assets/wedding-events-hero.jpg"}]',
  '[{"title": "Venue & Decor", "description": "Stunning venues and breathtaking decorations"}, {"title": "Catering Excellence", "description": "Multi-cuisine gourmet catering experiences"}, {"title": "Entertainment", "description": "Live bands, DJs, and cultural performances"}, {"title": "Photography & Video", "description": "Cinematic documentation of your celebration"}, {"title": "Guest Management", "description": "Seamless hospitality for all guests"}, {"title": "Coordination", "description": "Day-of coordination and vendor management"}]',
  '[{"step": 1, "title": "Dream Consultation", "description": "We listen to your vision, preferences, and dreams for the perfect celebration."}, {"step": 2, "title": "Design & Planning", "description": "Creating detailed plans, mood boards, and vendor coordination."}, {"step": 3, "title": "Pre-Event Setup", "description": "Complete venue transformation and rehearsals."}, {"step": 4, "title": "Celebration Day", "description": "Seamless execution ensuring you enjoy every moment of your special day."}]',
  'Ready to Plan Your Dream Wedding?',
  'Let us create a celebration that tells your unique love story with elegance, grandeur, and unforgettable moments.',
  'Start Planning',
  ARRAY['wedding', 'reception', 'sangeet', 'mehendi', 'destination-wedding', 'traditional'],
  'Wedding Specialties',
  'Our Wedding Services',
  true
),

-- 4. Entertainment & Lifestyle
(
  'entertainment-lifestyle',
  'Entertainment & Lifestyle Events',
  'From electrifying concerts to glamorous award shows, Avens creates entertainment experiences that captivate audiences and create lasting memories.',
  'Our entertainment events combine technical excellence with creative vision for unforgettable experiences.',
  'Unforgettable Shows',
  'Entertainment & Lifestyle',
  'Experience the magic of world-class entertainment events. Avens brings together artistry, technology, and passion to create spectacular shows.',
  'Plan Your Event',
  '/src/assets/entertainment-lifestyle-hero.jpg',
  'entertainment-lifestyle',
  'Entertainment event management by Avens. Concerts, music festivals, film festivals, award shows, and celebrity events.',
  '[{"title": "Concerts & Music Festivals", "description": "Large-scale concerts and multi-day music festivals with world-class production and artist management.", "imageUrl": "/src/assets/entertainment-lifestyle-hero.jpg"}, {"title": "Film & Award Shows", "description": "Glamorous film premieres and award ceremonies with red carpet experiences and celebrity hosting.", "imageUrl": "/src/assets/entertainment-lifestyle-hero.jpg"}, {"title": "Celebrity Events", "description": "Exclusive celebrity appearances, fan meets, and VIP events with complete artist coordination.", "imageUrl": "/src/assets/entertainment-lifestyle-hero.jpg"}, {"title": "Fashion Shows", "description": "High-fashion runway events with stunning stage design, lighting, and model coordination.", "imageUrl": "/src/assets/entertainment-lifestyle-hero.jpg"}]',
  '[{"title": "Stage Production", "description": "Spectacular stage designs and constructions"}, {"title": "Sound & Lighting", "description": "Concert-grade audio and lighting systems"}, {"title": "Artist Management", "description": "Complete celebrity and artist coordination"}, {"title": "Ticketing & Access", "description": "Event ticketing and crowd management"}, {"title": "Live Broadcasting", "description": "Multi-camera live streaming and recording"}, {"title": "VIP Experience", "description": "Premium hospitality and backstage access"}]',
  '[{"step": 1, "title": "Concept Development", "description": "Creating the show concept, artist lineup, and production design."}, {"step": 2, "title": "Technical Planning", "description": "Detailed technical riders, staging plans, and production schedules."}, {"step": 3, "title": "Show Production", "description": "Complete technical setup, rehearsals, and sound checks."}, {"step": 4, "title": "Live Show", "description": "Flawless show execution with real-time production management."}]',
  'Planning an Entertainment Event?',
  'Create unforgettable entertainment experiences that wow audiences and leave lasting impressions.',
  'Get Started',
  ARRAY['concert', 'festival', 'award-show', 'fashion', 'celebrity', 'entertainment'],
  'Entertainment Expertise',
  'Production Services',
  true
),

-- 5. Sports & Outdoor Events
(
  'sports-outdoor',
  'Sports & Outdoor Events',
  'Avens delivers exceptional sports events from tournaments to marathons, with professional infrastructure, branding, and athlete management.',
  'Our sports event management ensures world-class infrastructure and seamless operations for competitive excellence.',
  'Champion Events',
  'Sports & Outdoor',
  'Elevate your sports event with professional management, world-class infrastructure, and unforgettable experiences for athletes and spectators.',
  'Organize Your Event',
  '/src/assets/sports-outdoor-hero.jpg',
  'sports-outdoor',
  'Sports event management by Avens. Tournaments, marathons, cycling events, and outdoor adventures with professional infrastructure.',
  '[{"title": "Sports Tournaments", "description": "Professional management of cricket, football, badminton, and multi-sport tournaments with complete infrastructure.", "imageUrl": "/src/assets/sports-outdoor-hero.jpg"}, {"title": "Marathons & Runs", "description": "City marathons, charity runs, and racing events with route planning, timing systems, and crowd management.", "imageUrl": "/src/assets/sports-outdoor-hero.jpg"}, {"title": "Cycling Events", "description": "Professional cycling races and recreational rides with complete safety and support infrastructure.", "imageUrl": "/src/assets/sports-outdoor-hero.jpg"}, {"title": "Adventure Events", "description": "Outdoor adventure events including trekking, camping, and team building activities.", "imageUrl": "/src/assets/sports-outdoor-hero.jpg"}]',
  '[{"title": "Venue Infrastructure", "description": "Temporary stadiums and sports facilities"}, {"title": "Timing & Scoring", "description": "Professional timing systems and scoreboards"}, {"title": "Athlete Services", "description": "Registration, hydration, and medical support"}, {"title": "Branding & Signage", "description": "Course branding and sponsor visibility"}, {"title": "Safety & Medical", "description": "Complete safety protocols and medical teams"}, {"title": "Broadcasting", "description": "Live coverage and sports photography"}]',
  '[{"step": 1, "title": "Event Scoping", "description": "Defining event format, rules, and infrastructure requirements."}, {"step": 2, "title": "Venue & Logistics", "description": "Securing venues, permits, and logistical arrangements."}, {"step": 3, "title": "Infrastructure Setup", "description": "Complete sports infrastructure and technical setup."}, {"step": 4, "title": "Event Day", "description": "Professional event execution with athlete and spectator management."}]',
  'Planning a Sports Event?',
  'Create memorable sporting experiences with professional infrastructure, safety, and world-class event management.',
  'Get in Touch',
  ARRAY['tournament', 'marathon', 'cycling', 'cricket', 'football', 'sports', 'outdoor'],
  'Sports Expertise',
  'Event Services',
  true
),

-- 6. Healthcare & Medical Events
(
  'healthcare-medical',
  'Healthcare & Medical Events',
  'Avens organizes professional medical conferences, pharma events, and health expos with scientific precision and industry compliance.',
  'Our healthcare event management ensures CME accreditation, scientific accuracy, and professional medical networking.',
  'Medical Excellence',
  'Healthcare & Medical Events',
  'Partner with Avens for professional medical conferences, CME programs, and pharma events that advance healthcare knowledge.',
  'Plan Your Conference',
  '/src/assets/healthcare-medical-hero.jpg',
  'healthcare-medical',
  'Healthcare event management by Avens. Medical conferences, CME programs, pharma events, and health expos.',
  '[{"title": "Medical Conferences", "description": "Scientific conferences with CME accreditation, abstract management, and expert speaker coordination.", "imageUrl": "/src/assets/healthcare-medical-hero.jpg"}, {"title": "Pharma Events", "description": "Product launches, symposiums, and educational events for pharmaceutical companies.", "imageUrl": "/src/assets/healthcare-medical-hero.jpg"}, {"title": "Health Expos", "description": "Public health awareness events and medical equipment exhibitions.", "imageUrl": "/src/assets/healthcare-medical-hero.jpg"}, {"title": "CME Programs", "description": "Accredited continuing medical education programs with certification management.", "imageUrl": "/src/assets/healthcare-medical-hero.jpg"}]',
  '[{"title": "CME Accreditation", "description": "Complete CME compliance and certification"}, {"title": "Abstract Management", "description": "Scientific paper and poster coordination"}, {"title": "Speaker Coordination", "description": "Medical expert and KOL management"}, {"title": "Compliance", "description": "Pharma and medical regulatory compliance"}, {"title": "Registration", "description": "Professional delegate registration systems"}, {"title": "Documentation", "description": "Scientific documentation and proceedings"}]',
  '[{"step": 1, "title": "Scientific Planning", "description": "Developing scientific agenda, speaker lineup, and CME requirements."}, {"step": 2, "title": "Compliance Review", "description": "Ensuring all regulatory and accreditation requirements are met."}, {"step": 3, "title": "Event Setup", "description": "Professional conference infrastructure with medical-grade AV."}, {"step": 4, "title": "Conference Execution", "description": "Seamless delivery with documentation and certification management."}]',
  'Planning a Medical Conference?',
  'Create impactful healthcare events that advance medical knowledge and foster professional collaboration.',
  'Contact Us',
  ARRAY['conference', 'cme', 'pharma', 'medical', 'health-expo', 'healthcare'],
  'Healthcare Expertise',
  'Medical Event Services',
  true
),

-- 7. Birthday & Private Parties
(
  'birthday-parties',
  'Birthday & Private Parties',
  'Celebrate life''s special moments with Avens. From magical children''s parties to elegant milestone celebrations, we create unforgettable private events.',
  'Our party planning ensures every celebration is personalized, fun, and absolutely memorable.',
  'Celebrate in Style',
  'Birthday & Private Parties',
  'Make every birthday and private celebration extraordinary with Avens. We create magical moments that last a lifetime.',
  'Plan Your Party',
  '/src/assets/birthday-parties-hero.jpg',
  'birthday-parties',
  'Birthday and private party planning by Avens. Kids parties, milestone celebrations, and exclusive private events.',
  '[{"title": "Kids Birthday Parties", "description": "Magical themed parties for children with entertainment, games, and delightful experiences.", "imageUrl": "/src/assets/birthday-parties-hero.jpg"}, {"title": "Milestone Celebrations", "description": "Elegant celebrations for significant birthdays - 1st, 18th, 25th, 50th, and beyond.", "imageUrl": "/src/assets/birthday-parties-hero.jpg"}, {"title": "Theme Parties", "description": "Custom themed events from Hollywood to Bollywood, retro to futuristic.", "imageUrl": "/src/assets/birthday-parties-hero.jpg"}, {"title": "Private Gatherings", "description": "Intimate private parties with personalized experiences and exclusive venues.", "imageUrl": "/src/assets/birthday-parties-hero.jpg"}]',
  '[{"title": "Theme Design", "description": "Custom themes and creative concepts"}, {"title": "Venue Decoration", "description": "Stunning party decorations and setups"}, {"title": "Entertainment", "description": "Games, performers, and activities"}, {"title": "Catering", "description": "Delicious food and themed cakes"}, {"title": "Photography", "description": "Professional event photography"}, {"title": "Party Favors", "description": "Custom gifts and return favors"}]',
  '[{"step": 1, "title": "Theme Selection", "description": "Choose your perfect party theme and style."}, {"step": 2, "title": "Planning & Design", "description": "Complete party planning with all details."}, {"step": 3, "title": "Setup & Decoration", "description": "Venue transformation and party setup."}, {"step": 4, "title": "Party Time!", "description": "Enjoy your celebration while we handle everything."}]',
  'Ready to Throw an Amazing Party?',
  'Let us create a celebration that will be remembered for years to come.',
  'Start Planning',
  ARRAY['birthday', 'kids-party', 'milestone', 'private-party', 'celebration'],
  'Party Specialties',
  'Our Party Services',
  true
),

-- 8. Equipment Rental
(
  'equipment-rental',
  'Premium Equipment Rental',
  'Avens offers premium event equipment rentals including German hangars, AC domes, staging, lighting, sound systems, and specialty structures for events of any scale.',
  'Our rental equipment is professionally maintained and comes with complete setup and technical support.',
  'Premium Rentals',
  'Event Equipment & Structures',
  'Access world-class event infrastructure with Avens'' premium rental services. From mega structures to technical equipment, we have it all.',
  'Explore Rentals',
  '/src/assets/equipment-rental-hero.jpg',
  'equipment-rental',
  'Premium event equipment rentals by Avens. German hangars, AC domes, staging, lighting, sound systems, and more.',
  '[{"title": "German Aluminum Hangars", "description": "Durable 20-50m span structures perfect for large exhibitions and outdoor events.", "imageUrl": "/src/assets/equipment-rental-hero.jpg"}, {"title": "AC Domes & Clear Spans", "description": "Climate-controlled transparent structures for premium events and VIP functions.", "imageUrl": "/src/assets/equipment-rental-hero.jpg"}, {"title": "Stage & Lighting", "description": "Concert-grade staging, intelligent lighting systems, and LED walls.", "imageUrl": "/src/assets/equipment-rental-hero.jpg"}, {"title": "Sound Systems", "description": "Professional line-array sound systems for events of any scale.", "imageUrl": "/src/assets/equipment-rental-hero.jpg"}]',
  '[{"title": "Structure Rental", "description": "Hangars, pavilions, and temporary venues"}, {"title": "Stage Equipment", "description": "Stages, trusses, and rigging systems"}, {"title": "Audio Visual", "description": "Sound, lighting, and LED displays"}, {"title": "Climate Control", "description": "AC units and industrial cooling"}, {"title": "Furniture", "description": "Event furniture and seating"}, {"title": "Technical Support", "description": "On-site technicians and operators"}]',
  '[{"step": 1, "title": "Requirement Assessment", "description": "Understanding your event needs and venue specifications."}, {"step": 2, "title": "Equipment Selection", "description": "Recommending the right equipment for your event."}, {"step": 3, "title": "Delivery & Setup", "description": "Professional delivery, installation, and testing."}, {"step": 4, "title": "Event Support", "description": "On-site technical support throughout your event."}]',
  'Need Premium Event Equipment?',
  'Access Avens'' extensive inventory of world-class event equipment and structures with professional support.',
  'View Catalog',
  ARRAY['hangar', 'dome', 'stage', 'lighting', 'sound', 'rental', 'equipment'],
  'Rental Categories',
  'Equipment Services',
  true
);

-- Insert Hero Banners for home page carousel
INSERT INTO public.hero_banners (
  event_type, title, subtitle, image_url, button_text, hero_text_1, hero_text_2, display_order, is_active
) VALUES
(
  'corporate-exhibitions',
  'Corporate Excellence',
  'Conferences, Trade Shows & Brand Experiences',
  '/src/assets/corporate-exhibitions-hero.jpg',
  'Explore Corporate',
  'Creating',
  'Impact',
  1,
  true
),
(
  'wedding-events',
  'Dream Weddings',
  'Luxury Celebrations Crafted with Love',
  '/src/assets/wedding-events-hero.jpg',
  'Plan Your Wedding',
  'Unforgettable',
  'Moments',
  2,
  true
),
(
  'government-events',
  'Nation-Scale Events',
  'Government Expos & Public Functions',
  '/src/assets/government-events-hero.jpg',
  'Learn More',
  'Mega',
  'Events',
  3,
  true
),
(
  'entertainment-lifestyle',
  'Entertainment Magic',
  'Concerts, Shows & Lifestyle Events',
  '/src/assets/entertainment-lifestyle-hero.jpg',
  'See Our Work',
  'Spectacular',
  'Shows',
  4,
  true
),
(
  'equipment-rental',
  'Premium Rentals',
  'World-Class Event Infrastructure',
  '/src/assets/equipment-rental-hero.jpg',
  'View Rentals',
  'Premium',
  'Equipment',
  5,
  true
);

-- Insert sample services for home page
INSERT INTO public.services (
  title, short_description, description, event_type, image_url, show_on_home, display_order, is_active
) VALUES
(
  'Corporate Events',
  'Conferences, seminars, and brand experiences that drive business results.',
  'From intimate board meetings to large-scale conferences, we create corporate events that achieve your business objectives with precision and professionalism.',
  'corporate-exhibitions',
  '/src/assets/corporate-exhibitions-hero.jpg',
  true,
  1,
  true
),
(
  'Wedding Planning',
  'Luxury weddings and celebrations crafted with love and attention to detail.',
  'Your love story deserves a magnificent celebration. We create dream weddings that reflect your unique journey.',
  'wedding-events',
  '/src/assets/wedding-events-hero.jpg',
  true,
  2,
  true
),
(
  'Government Events',
  'National expos, public functions, and official ceremonies with protocol compliance.',
  'Trusted by government bodies across India for large-scale public events with impeccable execution.',
  'government-events',
  '/src/assets/government-events-hero.jpg',
  true,
  3,
  true
),
(
  'Entertainment Events',
  'Concerts, award shows, and lifestyle events that captivate audiences.',
  'From electrifying concerts to glamorous award shows, we create entertainment experiences that leave lasting impressions.',
  'entertainment-lifestyle',
  '/src/assets/entertainment-lifestyle-hero.jpg',
  true,
  4,
  true
),
(
  'Sports Events',
  'Tournaments, marathons, and outdoor events with professional infrastructure.',
  'World-class sports event management with professional timing, athlete services, and spectator experiences.',
  'sports-outdoor',
  '/src/assets/sports-outdoor-hero.jpg',
  true,
  5,
  true
),
(
  'Equipment Rentals',
  'Premium structures, staging, lighting, and sound systems for any event.',
  'Access our extensive inventory of world-class event equipment including German hangars, AC domes, and technical production.',
  'equipment-rental',
  '/src/assets/equipment-rental-hero.jpg',
  true,
  6,
  true
);

-- Insert sample rentals
INSERT INTO public.rentals (
  title, short_description, description, categories, price_range, image_url, show_on_home, display_order, is_active, rating
) VALUES
(
  'German Aluminum Hangar (20m)',
  'Durable weather-resistant structure perfect for medium exhibitions.',
  'Our German-engineered aluminum hangars provide reliable shelter for events of all types. 20-meter clear span with no internal supports, ideal for trade shows and exhibitions.',
  ARRAY['Structures', 'Hangars'],
  'Contact for Quote',
  '/src/assets/equipment-rental-hero.jpg',
  true,
  1,
  true,
  4.9
),
(
  'German Aluminum Hangar (50m)',
  'Mega structure for large-scale exhibitions and events.',
  '50-meter clear span German hangar suitable for major exhibitions, concerts, and large gatherings. Complete with flooring, lighting, and climate control options.',
  ARRAY['Structures', 'Hangars'],
  'Contact for Quote',
  '/src/assets/equipment-rental-hero.jpg',
  true,
  2,
  true,
  4.8
),
(
  'AC Dome Structure',
  'Climate-controlled transparent dome for premium events.',
  'Stunning geodesic dome with full air conditioning for VIP events, product launches, and exclusive parties. Available in various sizes.',
  ARRAY['Structures', 'Domes'],
  'Contact for Quote',
  '/src/assets/equipment-rental-hero.jpg',
  true,
  3,
  true,
  5.0
),
(
  'Concert Stage System',
  'Professional concert-grade staging with complete rigging.',
  'Full concert stage package including main stage, wings, roof system, and rigging points. Suitable for major concerts and festivals.',
  ARRAY['Stages', 'Entertainment'],
  'Contact for Quote',
  '/src/assets/equipment-rental-hero.jpg',
  true,
  4,
  true,
  4.9
),
(
  'Line Array Sound System',
  'Professional audio for concerts and large events.',
  'Industry-leading line array speaker system with complete FOH and monitor setup. Includes mixing console and professional operators.',
  ARRAY['Audio', 'Technical'],
  'Contact for Quote',
  '/src/assets/equipment-rental-hero.jpg',
  true,
  5,
  true,
  4.8
),
(
  'Intelligent Lighting Package',
  'Moving head lights, LED walls, and atmospheric effects.',
  'Complete intelligent lighting package including moving heads, LED washes, LED walls, haze machines, and DMX control.',
  ARRAY['Lighting', 'Technical'],
  'Contact for Quote',
  '/src/assets/equipment-rental-hero.jpg',
  true,
  6,
  true,
  4.9
),
(
  'Airwingz 100 TR Chiller',
  'Industrial cooling for large venues and outdoor events.',
  '100 TR capacity industrial air conditioning unit for cooling large temporary structures. Complete with ducting and installation.',
  ARRAY['Climate Control', 'Technical'],
  'Contact for Quote',
  '/src/assets/equipment-rental-hero.jpg',
  true,
  7,
  true,
  4.7
),
(
  'Double Decker Pavilion',
  'Two-level exhibition structure for maximum visibility.',
  'Premium double-decker structure ideal for exhibitions and brand activations. Excellent visibility and maximum floor space utilization.',
  ARRAY['Structures', 'Pavilions'],
  'Contact for Quote',
  '/src/assets/equipment-rental-hero.jpg',
  true,
  8,
  true,
  4.8
);

-- Insert sample trusted clients
INSERT INTO public.trusted_clients (name, logo_url, display_order, is_active) VALUES
('Government of India', '/placeholder.svg', 1, true),
('Telangana State', '/placeholder.svg', 2, true),
('Andhra Pradesh', '/placeholder.svg', 3, true),
('DRDO', '/placeholder.svg', 4, true),
('ISRO', '/placeholder.svg', 5, true),
('Hyderabad Metro', '/placeholder.svg', 6, true);

-- Insert sample testimonials
INSERT INTO public.client_testimonials (client_name, company, position, testimonial, rating, display_order, is_active) VALUES
('Rajesh Kumar', 'Tech Innovators Ltd', 'CEO', 'Avens delivered an exceptional corporate conference for us. Their attention to detail and professional execution exceeded our expectations. Highly recommended!', 5, 1, true),
('Priya Sharma', 'Wedding Client', 'Bride', 'Our dream wedding became reality thanks to Avens. Every moment was magical, from the décor to the coordination. They truly understand how to create unforgettable celebrations.', 5, 2, true),
('Dr. Venkat Rao', 'Indian Medical Association', 'Secretary', 'The medical conference organized by Avens was world-class. CME accreditation, scientific program, and logistics were handled flawlessly.', 5, 3, true),
('Suresh Reddy', 'State Government', 'Event Coordinator', 'Avens has been our trusted partner for multiple government events. Their ability to handle large-scale events with protocol compliance is unmatched.', 5, 4, true);

-- Insert about content
INSERT INTO public.about_content (
  mission_statement, vision_statement, full_about_text, founder_name, founder_quote, founder_note
) VALUES (
  'To deliver world-class events that inspire, engage, and empower our clients and their audiences.',
  'To be Asia''s most trusted partner for large-scale events and premium rentals.',
  'Founded in 2006, Avens Expositions Pvt. Ltd. has grown to become one of India''s leading event management and rental solution companies. Headquartered in Hyderabad, we specialize in end-to-end event planning combined with premium rental services.

Our journey began with a simple vision: to transform how events are conceived, planned, and executed in India. Over the years, we have had the privilege of organizing thousands of events across categories - from intimate corporate meetings to nation-scale exhibitions, from dream weddings to electrifying concerts.

What sets Avens apart is our commitment to innovation, safety, and flawless execution. We invest continuously in world-class infrastructure, including German-engineered structures, state-of-the-art AV equipment, and trained professionals who bring expertise and passion to every project.

Our portfolio includes partnerships with government bodies, Fortune 500 companies, and families who trust us with their most important celebrations. Each event is a testament to our values of excellence, reliability, and customer focus.

As we look to the future, Avens remains committed to pushing boundaries, embracing sustainability, and creating experiences that leave lasting impressions.',
  'Founder & Director',
  'We don''t just plan events — we create experiences that inspire and endure.',
  'Since 2006, my team and I have been privileged to be part of countless celebrations, achievements, and milestones. Every event is a story, and we are honored to help our clients tell theirs beautifully. Innovation, precision, and passion — that''s the Avens way.'
);