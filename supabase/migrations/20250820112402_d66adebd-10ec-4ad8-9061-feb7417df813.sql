-- Fix RLS policies for FAQ table
DROP POLICY IF EXISTS "Allow all access to faq" ON public.faq;

-- Create proper RLS policies for FAQ
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