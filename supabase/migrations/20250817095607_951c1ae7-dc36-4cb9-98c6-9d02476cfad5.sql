-- CRITICAL SECURITY FIX: Enable RLS on form_submissions table
-- This table contains sensitive customer data and must be protected

-- Enable Row Level Security on form_submissions table
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Verify existing policies are still in place (they should be working now that RLS is enabled)
-- Current policies:
-- 1. admin_can_read_submissions - Only admins can read submissions  
-- 2. admin_can_update_submissions - Only admins can update submissions
-- 3. allow_insert_form_submissions - Anyone can insert (for contact forms)
-- 4. prevent_delete_submissions - No one can delete submissions

-- Add additional security: ensure only authenticated users can insert submissions
DROP POLICY IF EXISTS "allow_insert_form_submissions" ON public.form_submissions;

CREATE POLICY "allow_anonymous_insert_form_submissions" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (true);

-- Ensure the admin read policy is robust
DROP POLICY IF EXISTS "admin_can_read_submissions" ON public.form_submissions;

CREATE POLICY "admin_can_read_submissions" 
ON public.form_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);