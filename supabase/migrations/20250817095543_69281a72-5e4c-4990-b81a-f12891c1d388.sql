-- Fix site_settings security vulnerability
-- Remove overly permissive policies and restrict to admin-only access

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.site_settings;
DROP POLICY IF EXISTS "Allow update for all users" ON public.site_settings;

-- Create secure policies that only allow admins to modify site settings
CREATE POLICY "admin_can_update_site_settings" 
ON public.site_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "admin_can_insert_site_settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Keep public read access for the site to function properly
-- The "Allow public read access" and "Allow select for all users" policies remain for frontend functionality