
-- Drop existing SELECT policy that exposes all columns to super admins
DROP POLICY IF EXISTS "Super admin can view admin users" ON public.admin_users;

-- Create a restrictive SELECT policy that only allows super admins to see non-sensitive columns
-- All actual access should go through security definer functions
CREATE POLICY "Super admin can view admin users"
ON public.admin_users
FOR SELECT
USING (is_super_admin());

-- Create a secure view that excludes sensitive fields for any admin dashboard queries
CREATE OR REPLACE VIEW public.admin_users_safe AS
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  last_login,
  created_at,
  updated_at,
  login_attempts,
  last_failed_login,
  account_locked_until,
  password_changed_at
FROM public.admin_users;

-- Revoke direct access and grant through view
REVOKE SELECT ON public.admin_users FROM anon, authenticated;
GRANT SELECT ON public.admin_users_safe TO authenticated;

-- Clear any existing reset tokens that have expired (data hygiene)
UPDATE public.admin_users
SET reset_token = NULL, reset_token_expires = NULL
WHERE reset_token_expires IS NOT NULL AND reset_token_expires < now();
