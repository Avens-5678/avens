-- Check and fix RLS policies for form_submissions table
-- Allow anonymous users to insert form submissions
DROP POLICY IF EXISTS "Anyone can submit forms" ON public.form_submissions;

CREATE POLICY "Anyone can submit forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to view all form submissions (for admin)
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.form_submissions;

CREATE POLICY "Authenticated users can view submissions" 
ON public.form_submissions 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to update submissions (for status changes)
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON public.form_submissions;

CREATE POLICY "Authenticated users can update submissions" 
ON public.form_submissions 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;