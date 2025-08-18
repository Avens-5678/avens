-- Create client testimonials table
CREATE TABLE public.client_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  testimonial TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  company TEXT,
  position TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Allow all access to client_testimonials" 
ON public.client_testimonials 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_testimonials_updated_at
BEFORE UPDATE ON public.client_testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some dummy testimonial data
INSERT INTO public.client_testimonials (client_name, testimonial, rating, company, position, display_order) VALUES
('Sarah Johnson', 'Avens Expositions transformed our corporate retreat into an extraordinary experience. Their attention to detail and professional execution exceeded all our expectations.', 5, 'TechCorp Solutions', 'Event Manager', 1),
('Michael Chen', 'The wedding planning services were absolutely phenomenal. Every moment was perfectly orchestrated, creating memories that will last a lifetime.', 5, '', 'Groom', 2),
('Emily Rodriguez', 'From concept to execution, the team delivered a flawless product launch event. Our guests were thoroughly impressed with the innovative setup and seamless flow.', 5, 'Innovation Labs', 'Marketing Director', 3),
('David Thompson', 'Outstanding service for our annual conference. The logistics management and technical support were world-class. Highly recommend for any corporate event.', 4, 'Global Enterprises', 'Operations Head', 4),
('Lisa Anderson', 'They made our birthday celebration magical! The creative decorations and entertainment kept everyone engaged throughout the event.', 5, '', 'Party Host', 5);

-- Update team members table with event industry dummy data
DELETE FROM public.team_members;

INSERT INTO public.team_members (name, role, short_bio, full_bio, display_order) VALUES
('Alexander Rivera', 'Chief Executive Officer & Creative Director', 'Visionary leader with 15+ years in luxury event design, specializing in transforming dreams into extraordinary experiences.', 'Alexander brings over 15 years of experience in luxury event planning and creative design. He has orchestrated high-profile weddings, corporate galas, and exclusive celebrations for celebrities and Fortune 500 companies. His innovative approach combines traditional elegance with cutting-edge technology to create unforgettable experiences. Under his leadership, Avens Expositions has become synonymous with excellence in the event industry.', 1),
('Sophia Martinez', 'Senior Event Coordinator & Wedding Specialist', 'Award-winning wedding planner who has coordinated over 300 celebrations, from intimate ceremonies to grand destination weddings.', 'Sophia is a certified wedding planner with a passion for creating personalized celebrations. She specializes in destination weddings and has planned events across 20+ countries. Her attention to detail and ability to manage complex logistics while maintaining a calm presence has earned her recognition as one of the top wedding coordinators in the industry. She speaks five languages and excels at working with diverse cultural traditions.', 2),
('James Thompson', 'Corporate Events Manager & Logistics Expert', 'Corporate event specialist managing conferences, product launches, and executive retreats for global companies and government organizations.', 'James oversees all corporate and government events with his extensive background in project management and logistics. He holds a PMP certification and has managed events for up to 10,000 attendees. His expertise includes virtual and hybrid events, having successfully transitioned many corporate clients to digital platforms during challenging times. He maintains relationships with venues worldwide and is known for his problem-solving abilities under pressure.', 3),
('Isabella Wong', 'Design Director & Styling Consultant', 'Creative genius behind stunning event aesthetics, specializing in floral design, lighting concepts, and immersive environment creation.', 'Isabella is an internationally trained floral designer and styling expert who brings artistic vision to every event. She studied at the London Flower School and has worked with luxury brands on fashion shows and product launches. Her signature style blends modern minimalism with organic elements, creating Instagram-worthy moments that perfectly complement each event\'s theme. She manages a team of designers and maintains partnerships with top florists and decorators.', 4),
('Marcus Johnson', 'Operations Manager & Vendor Relations', 'Logistics mastermind ensuring seamless event execution through strategic vendor partnerships and efficient resource management.', 'Marcus handles all operational aspects of event planning, from vendor coordination to timeline management. With a background in supply chain management, he has developed an extensive network of trusted suppliers, caterers, and service providers. His systematic approach to operations ensures that every event runs smoothly, on time, and within budget. He also oversees equipment rentals and maintains our inventory of premium event supplies.', 5),
('Aria Patel', 'Marketing Director & Client Relations', 'Strategic marketing professional focused on brand storytelling and building lasting relationships with clients and industry partners.', 'Aria drives the company\'s marketing initiatives and maintains our strong client relationships. With an MBA in Marketing and experience in luxury brand management, she understands how to position events as premium experiences. She manages our social media presence, coordinates with photographers and videographers, and ensures every event becomes a powerful marketing story for our clients. Her approach combines data-driven strategies with creative storytelling.', 6);