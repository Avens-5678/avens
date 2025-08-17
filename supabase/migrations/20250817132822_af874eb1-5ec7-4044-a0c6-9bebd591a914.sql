-- Create proper auth users for admin accounts and link them to admin_users
-- First, ensure we have the admin users in the admin_users table with proper UUIDs that match auth.users

-- Update admin_users to use proper UUIDs and link to auth users
UPDATE public.admin_users 
SET id = '4dbea7c7-9a60-4221-8fda-9b38a0589f97'::uuid
WHERE email = 'admin@avensevents.com';

-- Create a simple function to check admin status using email lookup
CREATE OR REPLACE FUNCTION public.is_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = user_email AND is_active = true
  );
$$;

-- Update site_settings RLS policies to use the new function
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "admin_can_insert_site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "admin_can_update_site_settings" ON public.site_settings;

-- Create new policies using email-based admin check
CREATE POLICY "admin_can_manage_site_settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (
  public.is_admin_by_email((auth.jwt() -> 'email')::text)
)
WITH CHECK (
  public.is_admin_by_email((auth.jwt() -> 'email')::text)
);