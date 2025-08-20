-- Fix form_submissions RLS policies for both anonymous form submission and admin access
-- Drop existing policies
DROP POLICY IF EXISTS "anonymous_can_insert_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "authenticated_can_select_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "authenticated_can_update_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "authenticated_can_delete_submissions" ON public.form_submissions;

-- Allow anonymous users to INSERT form submissions
CREATE POLICY "public_can_insert_form_submissions" 
ON public.form_submissions 
FOR INSERT 
TO public
WITH CHECK (true);

-- Allow anyone to SELECT form submissions (for admin access)
CREATE POLICY "public_can_select_form_submissions" 
ON public.form_submissions 
FOR SELECT 
TO public
USING (true);

-- Allow anyone to UPDATE form submissions (for admin access)
CREATE POLICY "public_can_update_form_submissions" 
ON public.form_submissions 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Allow anyone to DELETE form submissions (for admin access)
CREATE POLICY "public_can_delete_form_submissions" 
ON public.form_submissions 
FOR DELETE 
TO public
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;