-- Revert the complex policy and use a simpler approach
-- Drop the policies I just created
DROP POLICY IF EXISTS "allow_anonymous_form_operations" ON public.form_submissions;
DROP POLICY IF EXISTS "allow_read_own_submission" ON public.form_submissions;

-- Restore a simple insert-only policy for anonymous users
CREATE POLICY "allow_anonymous_insert_only" 
ON public.form_submissions 
FOR INSERT 
TO public
WITH CHECK (true);