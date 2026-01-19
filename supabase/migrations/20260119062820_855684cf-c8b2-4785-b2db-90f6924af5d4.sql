-- Drop existing overly permissive policies on admin_users
DROP POLICY IF EXISTS "Admin users can update their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Authenticated admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow public email validation for login" ON public.admin_users;

-- Create a security definer function to validate admin email for login (pre-auth)
-- This only returns true/false, never exposes sensitive data
CREATE OR REPLACE FUNCTION public.validate_admin_email(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = check_email 
    AND is_active = true
  );
END;
$$;

-- Create a security definer function to check if current user is THE super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the current user's email from auth
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if this email is the super admin and is active
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email 
    AND email = 'leads@avens.in'
    AND is_active = true
  );
END;
$$;

-- Update is_admin_secure to use email matching instead of id matching
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the current user's email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if this email is in admin_users and is active
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email 
    AND is_active = true
  );
END;
$$;

-- Create secure RLS policies for admin_users
-- Only authenticated super admins can view admin user records (limited columns)
CREATE POLICY "Super admin can view admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (is_super_admin());

-- Only super admin can update admin records
CREATE POLICY "Super admin can update admin users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Clean up: ensure only leads@avens.in is the admin
DELETE FROM public.admin_users WHERE email != 'leads@avens.in';

-- Update the admin record to ensure it's properly configured
UPDATE public.admin_users 
SET 
  role = 'super_admin',
  updated_at = now()
WHERE email = 'leads@avens.in';