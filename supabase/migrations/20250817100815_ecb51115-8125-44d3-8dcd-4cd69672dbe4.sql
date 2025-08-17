-- Fix delete functionality: Allow authenticated users to delete form submissions
-- The current policy blocks all deletes with qual:false

-- Drop the restrictive delete policy
DROP POLICY IF EXISTS "prevent_delete_submissions" ON public.form_submissions;

-- Create a new policy that allows authenticated users (admins) to delete submissions
CREATE POLICY "authenticated_can_delete_submissions" 
ON public.form_submissions 
FOR DELETE 
TO authenticated
USING (true);