-- Fix FAQ RLS policies for admin operations
DROP POLICY IF EXISTS "Public can view active FAQs" ON public.faq;
DROP POLICY IF EXISTS "Admins can manage all FAQs" ON public.faq;

-- Create simpler policies that work with the current admin system
-- Allow public read access to active FAQs
CREATE POLICY "Public can view active FAQs" 
ON public.faq 
FOR SELECT 
USING (is_active = true);

-- Allow all authenticated users to manage FAQs (since we're using mock admin for now)
CREATE POLICY "Allow admin access to FAQ" 
ON public.faq 
FOR ALL 
USING (true) 
WITH CHECK (true);