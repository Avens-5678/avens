-- Update existing events or insert if they don't exist
INSERT INTO public.events (event_type, title, description, process_description, hero_image_url) VALUES
('anniversary', 'Anniversary Celebrations', 'Celebrate your love story with an elegant anniversary event that honors your journey together. Whether its your first anniversary or your golden jubilee, we create meaningful celebrations that reflect your unique relationship and the milestones youve achieved.

Our anniversary events range from intimate dinners for two to grand celebrations with family and friends. We understand that each anniversary is special and deserves to be commemorated in a way that speaks to your hearts.', 'Anniversary planning begins with understanding your relationship story and what this milestone means to you. We discuss your preferred style, guest count, and budget to create the perfect celebration.

We help select the ideal venue that reflects your personality as a couple, whether its where you first met, got married, or simply a beautiful location that speaks to you.

Our team coordinates all details including decor, catering, entertainment, and special touches that honor your journey together. We can incorporate photos, memories, and meaningful elements from your relationship.

On your anniversary, we ensure everything runs smoothly so you can focus on celebrating your love and the memories youve created together.', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1200&h=800&fit=crop'),

('social', 'Social Event Coordination', 'From family reunions to graduation parties, community events to holiday celebrations, our social event coordination services help you bring people together for memorable occasions. We understand that social events are about connection, celebration, and creating lasting memories.

Our experienced team handles all the logistics so you can focus on enjoying time with your guests. Whether youre planning a small gathering or a large community event, we have the expertise to make it successful.', 'Social event planning starts with understanding the purpose of your gathering and who youll be hosting. We work with you to determine the best format, venue, and activities for your specific group.

We assist with venue selection, catering options, entertainment booking, and activity planning. Our team coordinates all vendors and manages the timeline to ensure smooth execution.

For larger social events, we handle registration, guest communications, and day-of coordination. We can also arrange special accommodations for different age groups or accessibility needs.

Throughout the event, our team manages all logistics and handles any unexpected situations, allowing you to be present and enjoy time with your guests.', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=800&fit=crop'),

('other', 'Custom Event Planning', 'Every celebration is unique, and sometimes your vision doesnt fit into traditional categories. Our custom event planning services are designed for those special occasions that require a personalized approach and creative solutions.

Whether its a themed party, cultural celebration, product launch, or any other special occasion, we bring creativity and expertise to make your vision a reality.', 'Custom event planning begins with in-depth consultation to understand your unique vision, requirements, and goals. We work closely with you to develop a concept that reflects your specific needs.

Our team researches and sources specialized vendors, unique venues, and custom elements that align with your vision. We handle all negotiations and coordinate complex logistics.

We create detailed planning documents and timelines tailored to your specific event type. Our team manages all aspects of execution while maintaining flexibility for unique requirements.

On the day of your event, we provide comprehensive management to ensure your custom celebration unfolds exactly as envisioned, handling any unique challenges that may arise.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop')

ON CONFLICT (event_type) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  process_description = EXCLUDED.process_description,
  hero_image_url = EXCLUDED.hero_image_url,
  updated_at = now();

-- Insert portfolio images for the new events
INSERT INTO public.portfolio (event_id, title, image_url, is_before_after, is_before, display_order) VALUES
-- Anniversary portfolio
((SELECT id FROM public.events WHERE event_type = 'anniversary' LIMIT 1), 'Romantic Anniversary Dinner Setup', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop', false, false, 1),
((SELECT id FROM public.events WHERE event_type = 'anniversary' LIMIT 1), 'Golden Anniversary Celebration', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop', false, false, 2),

-- Social events portfolio  
((SELECT id FROM public.events WHERE event_type = 'social' LIMIT 1), 'Family Reunion Gathering', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop', false, false, 1),
((SELECT id FROM public.events WHERE event_type = 'social' LIMIT 1), 'Graduation Celebration', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop', false, false, 2),

-- Other events portfolio
((SELECT id FROM public.events WHERE event_type = 'other' LIMIT 1), 'Themed Cultural Event', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop', false, false, 1),
((SELECT id FROM public.events WHERE event_type = 'other' LIMIT 1), 'Custom Product Launch', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop', false, false, 2);