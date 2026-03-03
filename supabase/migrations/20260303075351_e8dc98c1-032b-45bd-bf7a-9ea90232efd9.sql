
-- Fix form_submissions INSERT policy to ensure it's permissive (not restrictive)
DROP POLICY IF EXISTS "public_can_insert_form_submissions" ON public.form_submissions;
CREATE POLICY "public_can_insert_form_submissions" 
ON public.form_submissions 
FOR INSERT 
TO public
WITH CHECK (true);
