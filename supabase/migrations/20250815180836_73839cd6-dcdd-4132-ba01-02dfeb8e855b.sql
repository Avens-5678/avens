-- Insert sample hero banners
INSERT INTO public.hero_banners (title, subtitle, image_url, event_type, button_text, display_order) VALUES
('Unforgettable Wedding Celebrations', 'Creating magical moments that last a lifetime with our premium wedding planning services', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop', 'wedding', 'Plan Your Wedding', 1),
('Professional Corporate Events', 'Elevate your business with sophisticated corporate event management and seamless execution', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&h=1080&fit=crop', 'corporate', 'Plan Corporate Event', 2),
('Memorable Birthday Parties', 'From intimate gatherings to grand celebrations, we make every birthday truly special', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&h=1080&fit=crop', 'birthday', 'Plan Birthday Party', 3);

-- Insert sample services
INSERT INTO public.services (title, description, short_description, event_type, display_order) VALUES
('Wedding Planning & Coordination', 'Complete wedding planning services from venue selection to day-of coordination. We handle every detail to ensure your special day is perfect, including vendor management, timeline creation, and stress-free execution.', 'Complete wedding planning from concept to execution with personalized attention to every detail.', 'wedding', 1),
('Corporate Event Management', 'Professional corporate event planning for conferences, seminars, product launches, and company celebrations. We ensure your business events reflect your brand and achieve your objectives.', 'Strategic corporate event planning that elevates your brand and engages your audience.', 'corporate', 2),
('Birthday Party Planning', 'Creative birthday party planning for all ages, from childrens themed parties to milestone celebrations. We bring your vision to life with unique themes and memorable experiences.', 'Personalized birthday celebrations that create lasting memories for guests of all ages.', 'birthday', 3),
('Anniversary Celebrations', 'Romantic anniversary event planning to celebrate love and milestones. From intimate dinners to grand celebrations, we create the perfect ambiance for your special occasion.', 'Romantic anniversary events that honor your journey and celebrate your love story.', 'anniversary', 4),
('Social Event Coordination', 'Full-service planning for social gatherings, reunions, graduations, and community events. We handle logistics so you can focus on enjoying time with your guests.', 'Seamless social event coordination for gatherings that bring people together.', 'social', 5);

-- Insert sample rentals
INSERT INTO public.rentals (title, description, short_description, price_range, display_order) VALUES
('Premium Table & Chair Sets', 'Elegant dining tables and chairs available in various styles including rustic wooden sets, modern glass tables, and classic mahogany collections. Perfect for formal dinners and celebrations.', 'Elegant dining furniture sets for sophisticated events', '$15-50 per set', 1),
('Professional Sound Systems', 'High-quality audio equipment including microphones, speakers, and mixing boards. Perfect for presentations, live music, and announcements at any event size.', 'Crystal-clear audio equipment for flawless sound quality', '$100-300 per day', 2),
('Stunning Lighting Solutions', 'Ambient and decorative lighting including string lights, chandeliers, uplighting, and spotlights. Transform any space with our professional lighting packages.', 'Beautiful lighting to create the perfect atmosphere', '$75-250 per setup', 3),
('Luxury Linens & Draping', 'Premium table linens, chair covers, and decorative draping in various colors and fabrics. Add elegance and sophistication to your event decor.', 'Premium fabrics and linens for elegant event styling', '$20-80 per piece', 4),
('Photo Booth & Props', 'Fun photo booth setups with custom backdrops and extensive prop collections. Create lasting memories with professional photo experiences for your guests.', 'Interactive photo experiences with professional quality results', '$200-500 per event', 5),
('Floral Arrangements', 'Fresh floral centerpieces, bouquets, and decorative arrangements. Custom designs available to match your color scheme and event theme.', 'Beautiful fresh flowers to enhance your event decor', '$50-200 per arrangement', 6);

-- Insert sample trusted clients
INSERT INTO public.trusted_clients (name, logo_url, display_order) VALUES
('Marriott Hotels', 'https://logos-world.net/wp-content/uploads/2020/06/Marriott-Logo.png', 1),
('Google', 'https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png', 2),
('Microsoft', 'https://logos-world.net/wp-content/uploads/2020/06/Microsoft-Logo.png', 3),
('Apple', 'https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png', 4),
('Amazon', 'https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png', 5),
('Netflix', 'https://logos-world.net/wp-content/uploads/2020/04/Netflix-Logo.png', 6);

-- Insert sample news & achievements
INSERT INTO public.news_achievements (title, content, short_content, image_url, display_order) VALUES
('Winner of Best Event Management Company 2024', 'We are thrilled to announce that Avens Events has been awarded the prestigious "Best Event Management Company 2024" by the National Event Planning Association. This recognition reflects our commitment to excellence, innovation, and exceptional client service. The award was presented at the annual industry gala, where our team was recognized for outstanding creativity and flawless execution across various event categories.', 'Honored to receive the Best Event Management Company award for our dedication to excellence.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop', 1),
('Successfully Managed 500+ Events This Year', 'This year marks a significant milestone for Avens Events as we successfully planned and executed over 500 events across various categories. From intimate wedding ceremonies to large corporate conferences, our team has demonstrated exceptional versatility and professionalism. This achievement showcases our growing reputation and the trust our clients place in our services.', 'Proud to have successfully coordinated over 500 events this year across all categories.', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop', 2),
('Featured in Event Planning Magazine', 'Avens Events was recently featured in the latest issue of Event Planning Magazine, highlighting our innovative approach to sustainable event management. The article showcases our eco-friendly practices and how we help clients create memorable events while minimizing environmental impact.', 'Featured in Event Planning Magazine for our innovative sustainable event practices.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', 3),
('New Partnership with Premier Venues', 'We are excited to announce our new partnership with over 20 premier venues across the region. This collaboration allows us to offer our clients exclusive access to some of the most sought-after locations, ensuring that every event has the perfect setting to match the occasion.', 'Expanded our venue network with partnerships across 20+ premium locations.', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop', 4);

-- Insert sample events
INSERT INTO public.events (event_type, title, description, process_description, hero_image_url) VALUES
('wedding', 'Dream Wedding Planning', 'Your wedding day is one of the most important days of your life, and we understand the significance of every detail. Our comprehensive wedding planning services ensure that your special day reflects your unique love story and personal style. From intimate ceremonies to grand celebrations, we work closely with couples to bring their vision to life.

We handle everything from venue selection and vendor coordination to timeline management and day-of execution. Our experienced team takes care of the logistics so you can focus on what truly matters - celebrating your love with family and friends.', 'Our wedding planning process begins with an initial consultation where we get to know you as a couple and understand your vision, budget, and preferences. We then create a detailed timeline and budget breakdown.

Next, we assist with venue selection and vendor coordination, leveraging our network of trusted professionals including photographers, florists, caterers, and musicians. We handle contract negotiations and ensure all details align with your vision.

During the planning phase, we provide regular updates and coordinate all vendor communications. We create detailed floor plans, manage RSVPs, and finalize all logistics.

On your wedding day, our team arrives early to oversee setup, coordinate vendors, and ensure everything runs smoothly. We handle any last-minute issues so you can enjoy your perfect day stress-free.', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&h=800&fit=crop'),

('corporate', 'Corporate Event Excellence', 'Elevate your business presence with our professional corporate event management services. Whether you are hosting a conference, product launch, annual meeting, or team building event, we create experiences that reflect your brand values and engage your audience effectively.

Our corporate events are designed to achieve your business objectives while providing memorable experiences for attendees. We understand the importance of professionalism, attention to detail, and seamless execution in the corporate environment.', 'Our corporate event planning process starts with understanding your business objectives, target audience, and desired outcomes. We conduct a thorough briefing to align our strategy with your goals.

We then develop a comprehensive event strategy including venue selection, technology requirements, catering options, and guest experience design. Our team handles all logistics from registration to post-event follow-up.

During execution, we provide on-site management to ensure professional delivery. We coordinate with your team, manage vendors, and handle any technical requirements.

Post-event, we provide detailed reporting and analysis to measure success against your objectives and gather feedback for future improvements.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop'),

('birthday', 'Memorable Birthday Celebrations', 'Celebrate another year of life with a birthday party that creates lasting memories. Our birthday event planning services cater to all ages and preferences, from childrens themed parties to sophisticated milestone celebrations for adults.

We specialize in creating personalized experiences that reflect the birthday persons personality and interests. Whether you envision an intimate gathering or a grand celebration, we bring creativity and attention to detail to every birthday event.', 'Birthday party planning begins with understanding the birthday persons preferences, favorite themes, and the type of celebration desired. We discuss guest count, budget, and venue options.

We then create a custom theme and design concept, including decorations, entertainment, and activities appropriate for the age group and interests of the celebrant.

Our team coordinates all aspects including invitations, catering, entertainment booking, and party favors. We handle setup and coordination on the day of the event.

During the party, we ensure smooth execution of all planned activities and manage any unexpected situations, allowing you to enjoy celebrating with your loved ones.', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&h=800&fit=crop');

-- Insert sample portfolio images
INSERT INTO public.portfolio (event_id, title, image_url, is_before_after, is_before, display_order) VALUES
-- Wedding portfolio (assume first event ID)
((SELECT id FROM public.events WHERE event_type = 'wedding' LIMIT 1), 'Elegant Garden Wedding Ceremony', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop', false, false, 1),
((SELECT id FROM public.events WHERE event_type = 'wedding' LIMIT 1), 'Romantic Reception Decor', 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop', false, false, 2),
((SELECT id FROM public.events WHERE event_type = 'wedding' LIMIT 1), 'Beautiful Bridal Table Setup', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=600&fit=crop', false, false, 3),
((SELECT id FROM public.events WHERE event_type = 'wedding' LIMIT 1), 'Venue Before Decoration', 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop&brightness=0.7', true, true, 4),
((SELECT id FROM public.events WHERE event_type = 'wedding' LIMIT 1), 'Venue After Transformation', 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop', true, false, 5),

-- Corporate portfolio
((SELECT id FROM public.events WHERE event_type = 'corporate' LIMIT 1), 'Professional Conference Setup', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop', false, false, 1),
((SELECT id FROM public.events WHERE event_type = 'corporate' LIMIT 1), 'Executive Networking Reception', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop', false, false, 2),
((SELECT id FROM public.events WHERE event_type = 'corporate' LIMIT 1), 'Product Launch Event', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop', false, false, 3),

-- Birthday portfolio
((SELECT id FROM public.events WHERE event_type = 'birthday' LIMIT 1), 'Colorful Birthday Party Setup', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop', false, false, 1),
((SELECT id FROM public.events WHERE event_type = 'birthday' LIMIT 1), 'Kids Birthday Party Entertainment', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop', false, false, 2),
((SELECT id FROM public.events WHERE event_type = 'birthday' LIMIT 1), 'Milestone Birthday Celebration', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop', false, false, 3);

-- Insert sample awards
INSERT INTO public.awards (title, description, logo_url, year, display_order) VALUES
('Best Event Management Company 2024', 'Awarded by National Event Planning Association for excellence in service delivery and client satisfaction.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop', 2024, 1),
('Excellence in Corporate Events 2023', 'Recognized for outstanding corporate event management and professional service standards.', 'https://images.unsplash.com/photo-1567427018141-95ea69e44a3e?w=100&h=100&fit=crop', 2023, 2),
('Customer Choice Award 2023', 'Voted by customers as the preferred event management company for quality and reliability.', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop', 2023, 3),
('Innovation in Event Design 2022', 'Awarded for creative and innovative approaches to event design and execution.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop', 2022, 4);

-- Insert sample about content
INSERT INTO public.about_content (founder_name, founder_image_url, founder_note, founder_quote, mission_statement, vision_statement, full_about_text) VALUES
('Sarah Johnson', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop', 'Sarah Johnson founded Avens Events in 2015 with a passion for creating extraordinary experiences. With over 10 years of experience in hospitality and event management, Sarah brings creativity, attention to detail, and a commitment to excellence to every project. Her background in luxury hospitality and event design has shaped Avens Events into a premier event management company.', 'Every event tells a story, and I believe our role is to help that story unfold beautifully. When clients trust us with their most important moments, we dont just plan events - we create memories that last a lifetime.', 'To create extraordinary and memorable experiences for our clients by providing exceptional event management services that exceed expectations. We are committed to turning visions into reality through meticulous planning, creative design, and flawless execution.', 'To be the most trusted and innovative event management company, known for transforming ordinary occasions into extraordinary celebrations. We envision a future where every event we touch becomes a cherished memory for our clients and their guests.', 'Founded in 2015, Avens Events has grown from a small startup to one of the regions most respected event management companies. Our journey began with a simple belief: every celebration deserves to be extraordinary.

Over the years, we have had the privilege of planning and executing thousands of events, from intimate gatherings to grand celebrations. Our team of experienced professionals brings together diverse skills in event design, project management, vendor relations, and customer service.

What sets us apart is our commitment to understanding each clients unique vision and bringing it to life with creativity and precision. We believe that successful events are built on strong relationships - with our clients, vendors, and team members.

Our comprehensive approach covers every aspect of event planning, from initial concept development to post-event follow-up. We work with trusted vendors and venues to ensure quality and reliability in every service we provide.

At Avens Events, we dont just plan events - we create experiences that reflect our clients personalities, values, and dreams. Whether its a wedding that celebrates love, a corporate event that builds connections, or a birthday party that creates joy, we are dedicated to making every moment special.

Our success is measured not just by the events we execute, but by the relationships we build and the memories we help create. We are proud to have earned the trust of hundreds of clients and to have been recognized with multiple industry awards for our excellence and innovation.

As we look to the future, we remain committed to evolving our services, embracing new technologies, and continuing to set the standard for exceptional event management. We invite you to experience the Avens Events difference and let us help you create your own extraordinary celebration.');