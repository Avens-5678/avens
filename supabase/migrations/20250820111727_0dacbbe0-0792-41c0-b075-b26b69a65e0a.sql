-- Create the FAQ table if it doesn't exist with proper structure
CREATE TABLE IF NOT EXISTS public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all access to faq" ON public.faq;

-- Create RLS policies for FAQ
-- Allow public read access to active FAQs
CREATE POLICY "Public can view active FAQs" 
ON public.faq 
FOR SELECT 
USING (is_active = true);

-- Allow admins to manage all FAQs
CREATE POLICY "Admins can manage all FAQs" 
ON public.faq 
FOR ALL 
USING (public.is_admin_secure()) 
WITH CHECK (public.is_admin_secure());

-- Create trigger for updated_at
CREATE TRIGGER update_faq_updated_at
BEFORE UPDATE ON public.faq
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default FAQ data if table is empty
INSERT INTO public.faq (question, answer, category, display_order, is_active) 
SELECT * FROM (VALUES
  ('What types of events do you specialize in?', 'We specialize in weddings, corporate events, birthday parties, government events, and private celebrations. Our team has extensive experience in planning and executing events of all sizes, from intimate gatherings to large-scale productions.', 'General', 1, true),
  ('How far in advance should I book your services?', 'We recommend booking at least 3-6 months in advance for weddings and large events, and 2-4 weeks for smaller gatherings. However, we understand that sometimes events come up last minute, so please contact us even if your event is coming up soon - we''ll do our best to accommodate you.', 'Booking', 2, true),
  ('How do you calculate pricing for events?', 'Our pricing depends on several factors including event type, guest count, venue, duration, services required, and customization level. We provide detailed quotes after understanding your specific needs. Contact us for a free consultation and personalized quote.', 'Pricing', 3, true),
  ('Do you provide venue decoration services?', 'Yes! We offer complete venue decoration services including floral arrangements, lighting design, table settings, backdrop creation, and themed decorations. Our design team works closely with you to bring your vision to life.', 'Services', 4, true),
  ('What rental equipment do you offer?', 'We offer a wide range of rental equipment including furniture (chairs, tables, sofas), audio/visual equipment (speakers, microphones, projectors), lighting systems, tents and canopies, catering equipment, and specialty items. Browse our rental catalog for a complete list.', 'Rentals', 5, true),
  ('Do you provide delivery and setup services?', 'Yes, we provide delivery, setup, and pickup services for all rental items. Our professional team ensures everything is properly installed and positioned according to your event layout. Delivery fees may apply based on location and distance.', 'Services', 6, true),
  ('What are your payment terms?', 'We typically require a 30% deposit to secure your booking, with the balance due 7 days before the event. We accept various payment methods including bank transfers, credit cards, and cash. Payment plans can be discussed for larger events.', 'Pricing', 7, true),
  ('What is your cancellation policy?', 'Cancellations made 30+ days before the event receive a full refund minus a small processing fee. Cancellations 15-30 days prior receive a 50% refund. Cancellations less than 15 days are subject to full charges. We understand emergencies happen and will work with you when possible.', 'Policies', 8, true),
  ('Do you offer event planning consultation?', 'Absolutely! Our experienced event planners provide consultation services to help you plan every detail of your event. This includes timeline creation, vendor coordination, budget planning, and day-of coordination to ensure everything runs smoothly.', 'Services', 9, true),
  ('Can you accommodate special dietary requirements or cultural preferences?', 'Yes, we work with trusted catering partners who can accommodate various dietary requirements including vegetarian, vegan, gluten-free, halal, and kosher options. We also respect and incorporate cultural preferences and traditions into your event planning.', 'Services', 10, true)
) AS data(question, answer, category, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.faq);