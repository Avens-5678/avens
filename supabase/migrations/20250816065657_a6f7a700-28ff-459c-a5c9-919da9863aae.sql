-- Insert sample data for the website

-- Insert about content
INSERT INTO about_content (
  full_about_text,
  vision_statement,
  founder_quote,
  founder_note,
  founder_name,
  mission_statement
) VALUES (
  'Avens Events is a premier event management company dedicated to creating extraordinary experiences for our clients. With years of experience in the industry, we have established ourselves as a trusted partner for individuals and organizations looking to host memorable events.

Our team of experienced professionals brings creativity, attention to detail, and a passion for excellence to every project. From intimate private gatherings to large-scale corporate events, we have the expertise and resources to make your vision a reality.

We believe that every event tells a story, and our role is to help you tell yours in the most compelling and memorable way possible. Through careful planning, innovative design, and flawless execution, we ensure that your guests have an unforgettable experience.',
  'To be the leading event management company that transforms ordinary occasions into extraordinary memories, setting new standards for creativity, quality, and customer satisfaction in the events industry.',
  'Every event is an opportunity to create magic. Our passion lies in turning dreams into reality and moments into memories that last a lifetime.',
  'As the founder of Avens Events, I have always believed that exceptional events require more than just good planning – they require heart, creativity, and an unwavering commitment to excellence. Our team shares this vision and works tirelessly to exceed expectations on every project.',
  'Sarah Johnson',
  'To create exceptional, personalized events that celebrate life''s most important moments while providing our clients with seamless, stress-free experiences through innovative planning, creative design, and impeccable execution.'
);

-- Insert sample services
INSERT INTO services (title, event_type, description, short_description) VALUES
('Elegant Weddings', 'wedding', 'Make your special day truly unforgettable with our comprehensive wedding planning services. From venue selection to final coordination, we handle every detail with care and precision.', 'Complete wedding planning and coordination services for your perfect day'),
('Corporate Events', 'corporate', 'Professional corporate event management including conferences, seminars, product launches, and company celebrations. We ensure your business events reflect your brand excellence.', 'Professional corporate event planning and management services'),
('Birthday Celebrations', 'birthday', 'Create magical birthday celebrations for all ages. From intimate family gatherings to grand milestone celebrations, we make every birthday special and memorable.', 'Memorable birthday party planning and celebration services'),
('Anniversary Parties', 'anniversary', 'Celebrate your love story with elegant anniversary celebrations. Whether it''s your first or 50th anniversary, we create beautiful moments to honor your journey together.', 'Romantic anniversary celebration planning and coordination'),
('Social Events', 'social', 'From baby showers to graduation parties, we create memorable social celebrations that bring people together for life''s special moments.', 'Delightful social event planning and celebration services'),
('Custom Events', 'other', 'Have a unique vision? We specialize in creating custom events tailored to your specific needs and requirements.', 'Custom event planning and coordination for unique celebrations');

-- Insert sample events
INSERT INTO events (title, event_type, description, process_description, hero_image_url) VALUES
('Dream Weddings', 'wedding', 'Your wedding day should be perfect in every way. We specialize in creating romantic, elegant weddings that reflect your unique love story and vision.', 'Our wedding planning process begins with an initial consultation to understand your vision and preferences. We then create a detailed timeline and budget, coordinate with vendors, handle venue logistics, and provide on-day coordination to ensure everything runs smoothly. Our team manages every aspect from invitations to the final send-off.', '/placeholder.svg'),
('Professional Corporate Events', 'corporate', 'Elevate your business with professionally managed corporate events that impress clients and motivate teams.', 'We start by understanding your business objectives and target audience. Our team then develops a comprehensive event strategy, manages vendor relationships, coordinates logistics, and provides on-site management to ensure your corporate event achieves its goals and reflects your brand values.', '/placeholder.svg'),
('Magical Birthday Celebrations', 'birthday', 'Create unforgettable birthday memories with our personalized celebration planning services.', 'Our birthday planning process includes theme development, venue coordination, decoration setup, entertainment booking, catering management, and full event coordination. We work closely with you to create a celebration that perfectly matches the birthday person''s personality and preferences.', '/placeholder.svg'),
('Romantic Anniversary Celebrations', 'anniversary', 'Honor your love story with beautifully orchestrated anniversary celebrations that capture your journey together.', 'We begin by learning about your relationship story and preferences. Our team then designs a celebration that reflects your journey, coordinates all logistics including venue, dining, entertainment, and decorations, ensuring your anniversary celebration is both romantic and memorable.', '/placeholder.svg'),
('Social Celebrations', 'social', 'From baby showers to graduation parties, we create joyful social celebrations that honor life''s special milestones and bring people together.', 'Our social event planning includes theme selection, invitation design, venue decoration, menu planning, entertainment coordination, and full event management. We create warm, celebratory atmospheres perfect for honoring special moments and achievements.', '/placeholder.svg'),
('Custom Celebrations', 'other', 'We specialize in unique, custom events tailored to your specific vision and requirements.', 'Our custom event planning process starts with understanding your unique vision and requirements. We then develop a comprehensive plan that includes creative design, vendor coordination, logistics management, and on-site execution to bring your custom celebration to life.', '/placeholder.svg');

-- Insert sample rentals
INSERT INTO rentals (title, description, short_description, price_range) VALUES
('Premium Table Settings', 'Elegant table settings including fine china, crystal glassware, and silverware for sophisticated dining experiences.', 'Complete elegant table setting packages', '$15-25 per setting'),
('Luxury Linens', 'High-quality tablecloths, napkins, and chair covers in various colors and fabrics to match your event theme.', 'Premium quality linens and fabric accessories', '$8-20 per piece'),
('Sophisticated Lighting', 'Professional lighting equipment including string lights, uplighting, and ambient lighting solutions.', 'Professional lighting equipment and installation', '$100-500 per event'),
('Sound & Entertainment', 'High-quality sound systems, microphones, and entertainment equipment for speeches and music.', 'Professional audio and entertainment systems', '$200-800 per event'),
('Elegant Furniture', 'Stylish chairs, tables, and lounge furniture to create comfortable and beautiful event spaces.', 'Premium event furniture and seating', '$25-75 per piece'),
('Decorative Elements', 'Beautiful centerpieces, floral arrangements, and decorative accessories to enhance your event ambiance.', 'Custom decorative pieces and arrangements', '$50-300 per arrangement'),
('Bar Services', 'Complete bar setup including glassware, bar tools, and professional bartending services.', 'Professional bar setup and service', '$300-1000 per event'),
('Photography Props', 'Fun and elegant photography props, backdrops, and photo booth accessories for memorable pictures.', 'Photography props and photo booth setups', '$150-400 per event');

-- Insert sample trusted clients
INSERT INTO trusted_clients (name, logo_url) VALUES
('Elite Hospitality Group', '/placeholder.svg'),
('Metropolitan Hotels', '/placeholder.svg'),
('Prestige Venues', '/placeholder.svg'),
('Luxury Resorts International', '/placeholder.svg'),
('Grand Event Centers', '/placeholder.svg'),
('Premier Catering Co.', '/placeholder.svg');

-- Insert sample awards
INSERT INTO awards (title, description, year, logo_url) VALUES
('Best Event Planner 2023', 'Recognized for excellence in event planning and customer satisfaction by the National Event Planning Association.', 2023, '/placeholder.svg'),
('Wedding Planner of the Year', 'Awarded by Bridal Magazine for outstanding wedding planning services and innovative design concepts.', 2023, '/placeholder.svg'),
('Customer Service Excellence', 'Honored for exceptional customer service and client satisfaction ratings consistently above 95%.', 2022, '/placeholder.svg'),
('Innovation in Events Award', 'Recognized for creative event design and implementation of new event technology solutions.', 2022, '/placeholder.svg');

-- Insert sample news and achievements
INSERT INTO news_achievements (title, short_content, content, image_url) VALUES
('Featured in Event Planning Magazine', 'Our latest wedding project was featured as the cover story in this month''s Event Planning Magazine.', 'We are thrilled to announce that our recent luxury wedding project at the Grand Ballroom has been selected as the cover story for Event Planning Magazine''s special edition on innovative wedding design. The feature highlights our unique approach to blending traditional elegance with modern sophistication, showcasing how we transformed the venue into a fairytale setting that perfectly captured the couple''s love story.', '/placeholder.svg'),
('Expanded Service Offerings', 'We''ve added new corporate event services to better serve our business clients.', 'In response to growing demand from our corporate clients, we have expanded our service offerings to include comprehensive corporate event management. Our new services cover everything from large-scale conferences and product launches to intimate executive retreats and team-building events. This expansion allows us to provide end-to-end event solutions for businesses of all sizes.', '/placeholder.svg'),
('Partnership with Luxury Venues', 'New partnerships with premium venues across the city enhance our service capabilities.', 'We are excited to announce strategic partnerships with five of the city''s most prestigious venues, including the Historic Grand Hotel, Riverside Convention Center, and the Art Museum Event Spaces. These partnerships provide our clients with exclusive access to premium locations and preferred pricing, further enhancing our ability to create extraordinary events in spectacular settings.', '/placeholder.svg'),
('Sustainability Initiative Launch', 'Introducing eco-friendly event planning options for environmentally conscious clients.', 'As part of our commitment to environmental responsibility, we have launched our Green Events initiative, offering sustainable event planning options that minimize environmental impact without compromising on quality or elegance. Our eco-friendly services include sustainable decor, locally-sourced catering, digital invitations, and waste reduction strategies.', '/placeholder.svg');

-- Insert sample portfolio items (these would normally have real image URLs)
INSERT INTO portfolio (title, image_url, event_id, is_before_after, is_before) 
SELECT 
  'Beautiful Wedding Ceremony Setup',
  '/placeholder.svg',
  e.id,
  false,
  false
FROM events e WHERE e.event_type = 'wedding'
UNION ALL
SELECT 
  'Elegant Reception Decor',
  '/placeholder.svg',
  e.id,
  false,
  false
FROM events e WHERE e.event_type = 'wedding'
UNION ALL
SELECT 
  'Corporate Conference Setup',
  '/placeholder.svg',
  e.id,
  false,
  false
FROM events e WHERE e.event_type = 'corporate'
UNION ALL
SELECT 
  'Birthday Party Celebration',
  '/placeholder.svg',
  e.id,
  false,
  false
FROM events e WHERE e.event_type = 'birthday';

-- Insert sample hero banners
INSERT INTO hero_banners (title, subtitle, image_url, event_type, button_text) VALUES
('Creating Unforgettable Moments', 'Premium event management and rental services for your special occasions', '/placeholder.svg', 'wedding', 'Explore Weddings'),
('Perfect Corporate Events', 'Professional event management that elevates your business image', '/placeholder.svg', 'corporate', 'Learn More'),
('Magical Celebrations', 'Making every birthday and anniversary truly special', '/placeholder.svg', 'birthday', 'Plan Your Party');