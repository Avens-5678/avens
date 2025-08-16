-- Fix infinite recursion in admin_users policies
-- The existing policies reference the admin_users table within their own policies, causing infinite recursion

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;

-- Create a security definer function to check admin status safely
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
$$;

-- Create new policies using the security definer function
CREATE POLICY "Admins can view admin users"
ON public.admin_users
FOR SELECT
USING (public.is_current_user_admin());

CREATE POLICY "Admins can update admin users"
ON public.admin_users
FOR UPDATE
USING (public.is_current_user_admin());