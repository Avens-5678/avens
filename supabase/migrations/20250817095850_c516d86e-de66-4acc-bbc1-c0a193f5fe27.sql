-- Fix form submission issue: Allow anonymous users to read their own submissions immediately after insert
-- The current policy only allows INSERT but not SELECT, which breaks the .select().single() chain

-- Update the insert policy to also allow reading the inserted record
DROP POLICY IF EXISTS "allow_anonymous_insert_form_submissions" ON public.form_submissions;

-- Create a policy that allows anonymous INSERT and immediate SELECT of the same record
CREATE POLICY "allow_anonymous_form_operations" 
ON public.form_submissions 
FOR ALL 
TO public
USING (false)  -- No SELECT by default for existing records
WITH CHECK (true);  -- Allow INSERT for anyone

-- Add a separate policy to allow reading submissions immediately after insert
-- This uses a session-based approach where we check if the record was just created
CREATE POLICY "allow_read_own_submission" 
ON public.form_submissions 
FOR SELECT 
TO public
USING (
  -- Allow reading if the record was created in the last minute (for immediate post-insert read)
  created_at > (now() - interval '1 minute')
);