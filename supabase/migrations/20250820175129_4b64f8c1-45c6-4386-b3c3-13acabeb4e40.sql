-- Clean up all existing form_submissions policies and create simple, working ones
-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anonymous form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Anyone can submit forms" ON public.form_submissions;
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Only authenticated admins can delete form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Only authenticated admins can read form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Only authenticated admins can update form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "allow_anonymous_insert_only" ON public.form_submissions;
DROP POLICY IF EXISTS "authenticated_can_delete_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "authenticated_can_read_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "authenticated_can_update_submissions" ON public.form_submissions;

-- Create simple, clear policies
-- Allow anyone (including anonymous users) to submit forms
CREATE POLICY "anonymous_can_insert_submissions" 
ON public.form_submissions 
FOR INSERT 
TO public
WITH CHECK (true);

-- Allow authenticated users to view all form submissions
CREATE POLICY "authenticated_can_select_submissions" 
ON public.form_submissions 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to update form submissions
CREATE POLICY "authenticated_can_update_submissions" 
ON public.form_submissions 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete form submissions
CREATE POLICY "authenticated_can_delete_submissions" 
ON public.form_submissions 
FOR DELETE 
TO authenticated
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;