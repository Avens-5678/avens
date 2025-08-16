-- Add explicit deny policy for public read access to form_submissions
-- This ensures customer contact information is fully protected

-- First, let's clean up duplicate policies by dropping redundant ones
DROP POLICY IF EXISTS "Admin read form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admin update form_submissions" ON public.form_submissions;

-- Add explicit deny policy for public users
CREATE POLICY "Deny public read access to form submissions"
ON public.form_submissions
FOR SELECT
TO public
USING (false);

-- Ensure only admins can read form submissions (keeping the working policy)
-- The existing "Admins can view all form submissions" policy should remain active

-- Add explicit deny policy for public updates (additional security)
CREATE POLICY "Deny public update access to form submissions"
ON public.form_submissions
FOR UPDATE
TO public
USING (false);

-- Add explicit deny policy for public deletes
CREATE POLICY "Deny public delete access to form submissions"
ON public.form_submissions
FOR DELETE
TO public
USING (false);