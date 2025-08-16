-- Enhanced security measures for admin_users table (Fixed)

-- Add audit columns for better security tracking
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS last_password_reset TIMESTAMP WITH TIME ZONE;

-- Drop existing overly permissive policies on admin_users table
DROP POLICY IF EXISTS "Deny public update access to admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Deny public delete access to admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Deny public read access to admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Deny public insert access to admin users" ON public.admin_users;

-- Create ultra-restrictive policies - completely block direct table access
CREATE POLICY "Block all direct admin_users access" 
ON public.admin_users 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Create a secure function for admin authentication that doesn't expose password hashes
CREATE OR REPLACE FUNCTION public.authenticate_admin(
  input_email TEXT,
  input_password_hash TEXT
)
RETURNS TABLE(
  admin_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  is_active BOOLEAN,
  needs_password_change BOOLEAN,
  login_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  max_attempts INTEGER := 5;
  lockout_duration INTERVAL := '30 minutes';
BEGIN
  -- Check if admin exists and account is not locked
  SELECT * INTO admin_record
  FROM public.admin_users 
  WHERE admin_users.email = input_email 
    AND admin_users.is_active = true
    AND (admin_users.account_locked_until IS NULL 
         OR admin_users.account_locked_until < now());

  -- If admin not found or account locked
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check if account is locked due to too many attempts
  IF admin_record.login_attempts >= max_attempts 
     AND admin_record.last_failed_login > (now() - lockout_duration) THEN
    RETURN;
  END IF;

  -- Verify password hash (in production, use proper password verification)
  IF admin_record.password_hash = input_password_hash THEN
    -- Reset login attempts on successful login
    UPDATE public.admin_users 
    SET login_attempts = 0,
        last_login = now(),
        last_failed_login = NULL
    WHERE id = admin_record.id;

    -- Return admin data (excluding password hash)
    RETURN QUERY SELECT 
      admin_record.id,
      admin_record.email,
      admin_record.full_name,
      admin_record.role,
      admin_record.is_active,
      (admin_record.password_changed_at < (now() - INTERVAL '90 days')) as needs_password_change,
      0 as login_attempts;
  ELSE
    -- Increment login attempts on failed login
    UPDATE public.admin_users 
    SET login_attempts = COALESCE(login_attempts, 0) + 1,
        last_failed_login = now(),
        account_locked_until = CASE 
          WHEN COALESCE(login_attempts, 0) + 1 >= max_attempts 
          THEN now() + lockout_duration 
          ELSE NULL 
        END
    WHERE id = admin_record.id;
    
    RETURN;
  END IF;
END;
$$;

-- Function to get admin users securely (no password hashes exposed)
CREATE OR REPLACE FUNCTION public.get_admin_users_secure()
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  is_active BOOLEAN,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER,
  last_failed_login TIMESTAMP WITH TIME ZONE,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow authenticated admins to view admin user data
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY 
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.is_active,
    u.last_login,
    u.created_at,
    u.updated_at,
    u.login_attempts,
    u.last_failed_login,
    u.account_locked_until,
    u.password_changed_at
  FROM public.admin_users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Function to update admin password with additional security
CREATE OR REPLACE FUNCTION public.update_admin_password(
  admin_id UUID,
  new_password_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to update passwords
  IF NOT is_admin() THEN
    RETURN FALSE;
  END IF;

  UPDATE public.admin_users 
  SET password_hash = new_password_hash,
      password_changed_at = now(),
      login_attempts = 0,
      account_locked_until = NULL,
      updated_at = now()
  WHERE id = admin_id AND is_active = true;

  RETURN FOUND;
END;
$$;

-- Function to safely create admin users (only for existing admins)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  input_email TEXT,
  input_full_name TEXT,
  input_password_hash TEXT,
  input_role TEXT DEFAULT 'admin'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  -- Only existing admins can create new admin users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE email = input_email) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;

  INSERT INTO public.admin_users (
    email, 
    full_name, 
    password_hash, 
    role, 
    created_by,
    password_changed_at,
    is_active
  )
  VALUES (
    input_email, 
    input_full_name, 
    input_password_hash, 
    input_role, 
    auth.uid(),
    now(),
    true
  )
  RETURNING id INTO new_admin_id;

  RETURN new_admin_id;
END;
$$;

-- Function to unlock admin account
CREATE OR REPLACE FUNCTION public.unlock_admin_account(admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can unlock accounts
  IF NOT is_admin() THEN
    RETURN FALSE;
  END IF;

  UPDATE public.admin_users 
  SET login_attempts = 0,
      account_locked_until = NULL,
      last_failed_login = NULL,
      updated_at = now()
  WHERE id = admin_id;

  RETURN FOUND;
END;
$$;