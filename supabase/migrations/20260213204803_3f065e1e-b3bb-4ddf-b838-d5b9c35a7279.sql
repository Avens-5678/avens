
-- Clear existing rentals and insert all 31 products from catalog
DELETE FROM public.rentals;

INSERT INTO public.rentals (title, short_description, description, price_range, categories, is_active, show_on_home, display_order, search_keywords, size_options) VALUES
-- Structures & Venues
('German Tent (40m Width) - Aluminium Frame', 'High-quality German structure with aluminum frame for large hangars and mega events.', 'High-quality German structure with aluminum frame. Available in white PVC or transparent sheet. Ideal for large hangars and mega events.', '₹50,000/day', ARRAY['Structures & Venues'], true, true, 1, 'german tent hangar aluminium frame pvc transparent mega event', ARRAY['40m Width']),

('Pagoda Tent (6m x 6m)', 'Standard pagoda gazebo for outdoor events, VIP lounges or entry kiosks.', 'Standard pagoda gazebo for outdoor events. Perfect for VIP lounges or entry kiosks.', '₹8,000/day', ARRAY['Structures & Venues'], true, true, 2, 'pagoda tent gazebo outdoor vip lounge kiosk', ARRAY['6m x 6m']),

('Main Stage (4ft Height)', 'Heavy-duty stage with plywood surface and grey carpeting.', 'Heavy-duty stage with plywood surface and grey carpeting. Includes skirting and steps.', '₹15,000/day', ARRAY['Stages & Platforms'], true, true, 3, 'stage plywood carpet skirting steps event', ARRAY['4ft Height']),

('Exhibition Octonorm Stall (3m x 3m)', 'Standard exhibition stall with panels, fascia, and basic electricity.', 'Standard exhibition stall with panels, fascia, and basic electricity.', '₹4,500/day', ARRAY['Structures & Venues'], true, true, 4, 'octonorm stall exhibition panels fascia', ARRAY['3m x 3m']),

('Fabricated Green Room', 'Private room with mirrors & lights for artists/VIPs.', 'Private room with mirrors & lights for artists/VIPs. Standard or VIP finish.', '₹10,000/day', ARRAY['Structures & Venues'], true, false, 5, 'green room artists vip mirrors lights', NULL),

('Fashion Show Ramp (Catwalk)', 'T-Ramp or I-Ramp for fashion shows, height adjustable.', 'T-Ramp or I-Ramp for fashion shows. Height adjustable.', '₹20,000/day', ARRAY['Stages & Platforms'], true, false, 6, 'ramp catwalk fashion show t-ramp i-ramp', NULL),

-- Power & Climate
('Silent DG Set (500 KVA)', 'Silent generator for high-capacity power backup with technical support.', 'Silent generator for high-capacity power backup. Includes fueling and technical support.', '₹45,000/day', ARRAY['Power & Climate'], true, true, 7, 'generator dg set silent power backup 500kva', ARRAY['500 KVA']),

('Tower AC (5 Ton)', 'Vertical tower AC unit for efficient cooling in hangars and halls.', 'Vertical tower AC unit for efficient cooling in hangars and halls.', '₹12,000/day', ARRAY['Power & Climate'], true, true, 8, 'tower ac cooling hangar hall air conditioner', ARRAY['5 Ton']),

('Industrial Chiller (150 Ton)', 'Heavy-duty cooling solution for mega hangars and industrial event spaces.', 'Heavy-duty cooling solution for mega hangars and industrial event spaces.', '₹1,20,000/day', ARRAY['Power & Climate'], true, false, 9, 'chiller industrial cooling mega hangar', ARRAY['150 Ton']),

-- AV Equipment
('LED Wall (P2.5 Indoor High-Res)', 'High-resolution indoor LED screen for sharp visuals and presentations.', 'High-resolution indoor LED screen for sharp visuals and presentations.', '₹25,000/day', ARRAY['Lighting & Sound'], true, true, 10, 'led wall screen indoor high resolution p2.5 visuals', ARRAY['P2.5 Pixel Pitch']),

('JBL VTX Line Array Sound System', 'Professional concert-grade sound system for large rallies and events.', 'Professional concert-grade sound system for large rallies and events.', '₹35,000/day', ARRAY['Lighting & Sound'], true, true, 11, 'jbl vtx line array sound system concert rally', NULL),

('Sennheiser Wireless Lapel Microphone', 'High-quality collar mic for speakers, anchors, and presentations.', 'High-quality collar mic for speakers, anchors, and presentations.', '₹1,500/day', ARRAY['Lighting & Sound'], true, false, 12, 'sennheiser lapel mic wireless microphone speaker', NULL),

('Sharpy 7R Moving Head Light', 'Professional beam effect light for concerts, stages, and weddings.', 'Professional beam effect light for concerts, stages, and weddings.', '₹2,500/day', ARRAY['Lighting & Sound'], true, true, 13, 'sharpy 7r moving head light beam concert stage wedding', NULL),

-- Furniture
('VIP Leather Sofa (2-Seater)', 'Premium white leather sofa for VIP seating and stage guests.', 'Premium white leather sofa for VIP seating and stage guests.', '₹2,500/day', ARRAY['Furniture'], true, true, 14, 'vip leather sofa white seating stage guests', ARRAY['2-Seater']),

('Banquet Chair (Cushion)', 'Standard banquet chair with cushion and armless design.', 'Standard banquet chair with cushion and armless design. Covers available separately.', '₹150/day', ARRAY['Furniture'], true, false, 15, 'banquet chair cushion armless event seating', NULL),

('High-Round Bar Table', 'Tall bar table with chrome base for cocktail parties and networking.', 'Tall bar table with chrome base. Ideal for cocktail parties and networking lounges.', '₹1,200/day', ARRAY['Furniture'], true, false, 16, 'bar table chrome cocktail party networking lounge', NULL),

-- Manpower
('Security Bouncer (Black Suit)', 'Professional security personnel for crowd management and VIP protection.', 'Professional security personnel for crowd management and VIP protection.', '₹3,500/day', ARRAY['Manpower'], true, false, 17, 'security bouncer crowd management vip protection', NULL),

('Registration Staff (Promoters)', 'Experienced staff for guest registration, ushering, and booth management.', 'Experienced boys and girls for guest registration, ushering, and booth management.', '₹1,500/day', ARRAY['Manpower'], true, false, 18, 'registration staff promoters ushering booth', NULL),

-- Branding & Signage
('Entrance Box Arch (Iron)', 'Fabricated iron box arch for event entrances with branding options.', 'Fabricated iron box arch for event entrances. Can be branded with vinyl or flex.', '₹5,000/day', ARRAY['Branding & Signage'], true, false, 19, 'entrance arch iron box branding vinyl flex', NULL),

('Self-Standing Chrome Signage (A3/A4)', 'Professional chrome stand for directional signage and information display.', 'Professional chrome stand for directional signage and information display.', '₹800/day', ARRAY['Branding & Signage'], true, false, 20, 'chrome signage stand directional information display', ARRAY['A3/A4']),

-- Flooring & Decor
('Synthetic Carpeting (New)', 'Brand new synthetic carpet in multiple colors. Price per sq. ft.', 'Brand new synthetic carpet available in multiple colors. Price per Sq. Ft.', '₹10/sq.ft', ARRAY['Flooring & Decor'], true, false, 21, 'synthetic carpet flooring colors new', NULL),

('Traditional Floral Arch', 'Beautiful floral arch for wedding entries and stage backdrops.', 'Beautiful floral arch for wedding entries and stage backdrops. Custom designs available.', '₹12,000/unit', ARRAY['Flooring & Decor'], true, true, 22, 'floral arch wedding entry stage backdrop', NULL),

('Artificial Turf (Grass Mat)', 'Green artificial grass for lawn feel indoors or outdoors. Price per sq ft.', 'Green artificial grass for lawn feel indoors or outdoors. Price per sq ft.', '₹15/sq.ft', ARRAY['Flooring & Decor'], true, false, 23, 'artificial turf grass mat lawn indoor outdoor', NULL),

-- Sanitation
('VIP Luxury Washroom (Container)', 'AC containerized washroom with high-end fittings for VIP events.', 'AC containerized washroom with high-end fittings. Male/Female sections.', '₹25,000/day', ARRAY['Sanitation'], true, false, 24, 'vip luxury washroom container ac bathroom', NULL),

('Portable Chemical Toilet', 'Single unit chemical toilet for general crowds and outdoor events.', 'Single unit chemical toilet for general crowds and outdoor events.', '₹3,000/day', ARRAY['Sanitation'], true, false, 25, 'portable chemical toilet outdoor event crowd', NULL),

-- Media & Services
('Drone Camera Service (4K)', 'Professional drone pilot with 4K camera for aerial shots.', 'Professional drone pilot with 4K camera for aerial shots.', '₹15,000/day', ARRAY['Media & Services'], true, false, 26, 'drone camera 4k aerial shots photography videography', NULL),

-- Logistics
('Eicher Truck (17ft)', 'Closed container truck for safe material transport.', 'Closed container truck for safe material transport.', '₹5,000/trip', ARRAY['Logistics'], true, false, 27, 'eicher truck transport logistics container', NULL),

-- Combo Packages
('Combo: Standard Exhibition Stall (3x3m)', 'Complete package with Octonorm Shell, Table, Chairs, Spotlights, Carpet & Name Board.', 'Complete package: 3m x 3m Octonorm Shell, 1 Table, 2 Chairs, 3 Spotlights, Carpet, Name Board, Dustbin. Ideal for trade shows.', '₹6,500/day', ARRAY['Combo Packages'], true, true, 28, 'combo exhibition stall octonorm trade show package', ARRAY['3m x 3m']),

('Combo: Mega Hangar Structure (40m Width)', 'Full package with German Tent, PVC Roof, Platform, Carpeting & Lighting.', 'Full package: 40m Width German Tent, PVC Roof, Wooden Platform, Carpeting, and Basic Lighting. For weddings and conventions.', '₹1,50,000/day', ARRAY['Combo Packages'], true, true, 29, 'combo mega hangar german tent wedding convention', ARRAY['40m Width']),

('Combo: Conference Stage Setup', 'Includes Main Stage, Backdrop Framing, Podium, Skirting, Carpet & Green Room.', 'Includes 24ft x 12ft Main Stage, Backdrop Framing, Podium, Skirting, Carpet, and 1 Green Room.', '₹45,000/day', ARRAY['Combo Packages'], true, true, 30, 'combo conference stage backdrop podium green room', NULL),

('Combo: VIP Lounge Package', 'Luxury setup with AC Pagoda, VIP Sofas, Center Table, AC, Carpet & Glass Door.', 'Luxury setup: 6m x 6m AC Pagoda, 2 VIP Sofa Sets, Center Table, 1.5 Ton AC, Carpet, Glass Door.', '₹25,000/day', ARRAY['Combo Packages'], true, true, 31, 'combo vip lounge pagoda sofa ac luxury', NULL);
