-- Update rentals table to support the new structured categories
-- Add new categories and rental items as requested

-- First, clear existing rental data to replace with new structure
DELETE FROM rentals;

-- Insert new rental categories and items with the structured data provided
INSERT INTO rentals (title, short_description, description, price_range, categories, search_keywords, display_order, is_active, show_on_home, rating, quantity) VALUES

-- Event Structures & Venues
('German Aluminum Hangars - 30m', 'Large-span hangars for exhibitions & conventions', 'Professional 30-meter German aluminum hangars perfect for large exhibitions, conventions, and outdoor events. Weather-resistant and quick to assemble.', 'AED 8,000 - 15,000', ARRAY['Event Structures & Venues'], 'hangar aluminum exhibition convention venue structure', 1, true, true, 4.8, 5),

('German Aluminum Hangars - 40m', 'Extra large hangars for mega events', 'Premium 40-meter German aluminum hangars designed for mega exhibitions, large conventions, and industrial events. Superior quality and durability.', 'AED 12,000 - 20,000', ARRAY['Event Structures & Venues'], 'hangar aluminum exhibition convention venue structure mega', 2, true, true, 4.9, 3),

('German Aluminum Hangars - 50m', 'Massive hangars for super events', 'Massive 50-meter German aluminum hangars for super-scale exhibitions, international conventions, and large outdoor gatherings.', 'AED 18,000 - 30,000', ARRAY['Event Structures & Venues'], 'hangar aluminum exhibition convention venue structure massive', 3, true, true, 5.0, 2),

('Event Pagodas', 'Outdoor event tents for weddings & fairs', 'Elegant outdoor event pagodas ideal for weddings, social events, fairs, and garden parties. Available in multiple sizes and configurations.', 'AED 500 - 2,000', ARRAY['Event Structures & Venues'], 'pagoda tent outdoor wedding fair social event', 4, true, true, 4.6, 15),

('Rain-proof Structures', 'Weather-resistant enclosures', 'Professional rain-proof structures and weather-resistant enclosures for outdoor events. Perfect for unpredictable weather conditions.', 'AED 1,200 - 4,000', ARRAY['Event Structures & Venues'], 'rainproof weather resistant outdoor structure enclosure', 5, true, true, 4.7, 8),

('Wooden Platforms & Staging', 'Raised platforms and stages', 'Professional wooden platforms and staging solutions from 6 inches to 6 feet in height. Perfect for performances, presentations, and elevated displays.', 'AED 300 - 1,500 per sqm', ARRAY['Event Structures & Venues'], 'wooden platform stage raised performance presentation', 6, true, true, 4.5, 20),

-- Exhibition & Stalls
('Modular Exhibition Stalls - Standard', 'Octanorm & Maxima stalls for trade fairs', 'Standard modular exhibition stalls using Octanorm and Maxima systems. Perfect for trade fairs, exhibitions, and corporate displays.', 'AED 800 - 2,500', ARRAY['Exhibition & Stalls'], 'exhibition stall modular octanorm maxima trade fair', 7, true, true, 4.7, 25),

('Customized Exhibition Stalls', 'Bespoke stall fabrication & design', 'Premium customized exhibition stalls with bespoke fabrication and design for enhanced branding and visitor engagement.', 'AED 2,000 - 8,000', ARRAY['Exhibition & Stalls'], 'custom exhibition stall bespoke fabrication design branding', 8, true, true, 4.8, 12),

('Ground Layouts & Booth Construction', 'Complete event & exhibition floor planning', 'Comprehensive ground layouts and booth construction services for events and exhibitions. Complete floor planning and setup.', 'AED 1,500 - 5,000', ARRAY['Exhibition & Stalls'], 'ground layout booth construction floor planning exhibition', 9, true, true, 4.6, 10),

-- Climate Control (Airwingz Division)
('Industrial Air Conditioners (15TR AW-15)', 'Powerful AC units for large gatherings', 'Industrial-grade 15TR AW-15 air conditioning units designed for large gatherings, exhibitions, and outdoor events. Powerful cooling capacity.', 'AED 1,200 - 2,500 per day', ARRAY['Climate Control'], 'industrial air conditioner AC 15TR large gathering exhibition cooling', 10, true, true, 4.9, 8),

('Spot Cooling Solutions', 'Temporary ACs for various events', 'Flexible spot cooling solutions with temporary air conditioning for exhibitions, weddings, concerts, and special events.', 'AED 400 - 1,200 per day', ARRAY['Climate Control'], 'spot cooling temporary AC wedding concert exhibition event', 11, true, true, 4.7, 15),

('3000 Tons Chiller Units', 'Heavy-duty cooling for mega events', 'Heavy-duty 3000-ton chiller units for mega exhibitions, conventions, and large-scale events requiring extensive cooling solutions.', 'AED 5,000 - 12,000 per day', ARRAY['Climate Control'], 'chiller 3000 tons heavy duty mega exhibition convention cooling', 12, true, true, 5.0, 3),

-- Event Production Equipment
('Audio Visual Systems', 'Professional sound and lighting setups', 'Complete professional audio visual systems including sound equipment, lighting setups, and technical support for events of all sizes.', 'AED 2,000 - 8,000', ARRAY['Event Production Equipment'], 'audio visual sound lighting professional setup technical', 13, true, true, 4.8, 10),

('LED Walls & Digital Displays', 'High-resolution video walls for branding', 'High-resolution LED walls and digital displays perfect for branding, live events, presentations, and promotional activities.', 'AED 3,000 - 12,000', ARRAY['Event Production Equipment'], 'LED wall digital display video branding live event presentation', 14, true, true, 4.9, 6),

('Sliding & Rolling Backdrops', 'Dynamic stage backdrops for launches', 'Professional sliding and rolling backdrops for dynamic stage presentations, product launches, and corporate events.', 'AED 800 - 3,000', ARRAY['Event Production Equipment'], 'sliding rolling backdrop stage dynamic product launch corporate', 15, true, true, 4.6, 8),

-- Branding & Décor
('Event Branding & Signage', 'Indoor & outdoor signage solutions', 'Comprehensive event branding and signage solutions for both indoor and outdoor events. Custom designs and professional installation.', 'AED 500 - 3,000', ARRAY['Branding & Décor'], 'branding signage indoor outdoor custom design installation', 16, true, true, 4.7, 20),

('Theme Party & Social Décor', 'Custom decorations for special events', 'Beautiful theme party and social décor for weddings, birthdays, anniversaries, and special celebrations. Custom themes available.', 'AED 1,000 - 5,000', ARRAY['Branding & Décor'], 'theme party social decor wedding birthday anniversary celebration', 17, true, true, 4.8, 15),

('Carpeting & Flooring', 'Exhibition-grade flooring solutions', 'Professional carpeting and flooring solutions specifically designed for exhibitions, events, and venue enhancement.', 'AED 25 - 80 per sqm', ARRAY['Branding & Décor'], 'carpeting flooring exhibition grade venue professional', 18, true, true, 4.5, 30);