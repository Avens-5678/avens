-- Fix team_members RLS policies to allow admin access
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;

-- Create policy that uses the existing is_admin() function
CREATE POLICY "Admin full access team_members" 
ON public.team_members 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());