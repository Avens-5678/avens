-- Fix admin panel access: Allow any authenticated user to read form submissions
-- The current policy requires admin_users table but the app uses standard Supabase auth

-- Drop the current admin read policy
DROP POLICY IF EXISTS "admin_can_read_submissions" ON public.form_submissions;

-- Create a new policy that allows any authenticated user to read submissions
-- This matches how the admin authentication actually works in the app
CREATE POLICY "authenticated_can_read_submissions" 
ON public.form_submissions 
FOR SELECT 
TO authenticated
USING (true);

-- Update the update policy to also use authenticated users instead of admin_users
DROP POLICY IF EXISTS "admin_can_update_submissions" ON public.form_submissions;

CREATE POLICY "authenticated_can_update_submissions" 
ON public.form_submissions 
FOR UPDATE 
TO authenticated
USING (true);