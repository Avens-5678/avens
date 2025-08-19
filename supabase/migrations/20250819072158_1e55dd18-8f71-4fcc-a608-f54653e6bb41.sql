-- Fix all storage bucket RLS policies to allow admin access

-- First, drop existing storage policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Authenticated users can upload to audio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read audio files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update audio files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete audio files" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload to portfolio-images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio-images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload to event-hero-images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read event-hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event-hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event-hero-images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload to specialty-images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read specialty-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update specialty-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete specialty-images" ON storage.objects;

-- Create a secure function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user exists in admin_users table and is active
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  );
END;
$$;

-- Update existing security functions with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = user_email AND is_active = true
  );
$$;

-- Audio bucket policies - Allow authenticated admins full access
CREATE POLICY "Admin users can upload audio files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'audio' AND 
  public.is_admin_secure()
);

CREATE POLICY "Admin users can read audio files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'audio' AND 
  (public.is_admin_secure() OR true) -- Allow public read for audio
);

CREATE POLICY "Admin users can update audio files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'audio' AND 
  public.is_admin_secure()
)
WITH CHECK (
  bucket_id = 'audio' AND 
  public.is_admin_secure()
);

CREATE POLICY "Admin users can delete audio files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'audio' AND 
  public.is_admin_secure()
);

-- Portfolio images bucket policies - Allow authenticated admins full access
CREATE POLICY "Admin users can upload portfolio images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images' AND 
  public.is_admin_secure()
);

CREATE POLICY "Public can read portfolio images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Admin users can update portfolio images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'portfolio-images' AND 
  public.is_admin_secure()
)
WITH CHECK (
  bucket_id = 'portfolio-images' AND 
  public.is_admin_secure()
);

CREATE POLICY "Admin users can delete portfolio images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolio-images' AND 
  public.is_admin_secure()
);

-- Event hero images bucket policies
CREATE POLICY "Admin users can upload event hero images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'event-hero-images' AND 
  public.is_admin_secure()
);

CREATE POLICY "Public can read event hero images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'event-hero-images');

CREATE POLICY "Admin users can update event hero images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'event-hero-images' AND 
  public.is_admin_secure()
)
WITH CHECK (
  bucket_id = 'event-hero-images' AND 
  public.is_admin_secure()
);

CREATE POLICY "Admin users can delete event hero images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'event-hero-images' AND 
  public.is_admin_secure()
);

-- Specialty images bucket policies
CREATE POLICY "Admin users can upload specialty images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'specialty-images' AND 
  public.is_admin_secure()
);

CREATE POLICY "Public can read specialty images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'specialty-images');

CREATE POLICY "Admin users can update specialty images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'specialty-images' AND 
  public.is_admin_secure()
)
WITH CHECK (
  bucket_id = 'specialty-images' AND 
  public.is_admin_secure()
);

CREATE POLICY "Admin users can delete specialty images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'specialty-images' AND 
  public.is_admin_secure()
);

-- Add RLS policies for site_settings table
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read site settings" ON public.site_settings
FOR SELECT TO authenticated
USING (public.is_admin_secure());

CREATE POLICY "Admin users can insert site settings" ON public.site_settings
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_secure());

CREATE POLICY "Admin users can update site settings" ON public.site_settings
FOR UPDATE TO authenticated
USING (public.is_admin_secure())
WITH CHECK (public.is_admin_secure());

CREATE POLICY "Admin users can delete site settings" ON public.site_settings
FOR DELETE TO authenticated
USING (public.is_admin_secure());

-- Update other security functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_admin_users_secure()
RETURNS TABLE(id uuid, email text, full_name text, role text, is_active boolean, last_login timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, login_attempts integer, last_failed_login timestamp with time zone, account_locked_until timestamp with time zone, password_changed_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated admins to view admin user data
  IF NOT public.is_admin_secure() THEN
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

CREATE OR REPLACE FUNCTION public.authenticate_admin(input_email text, input_password_hash text)
RETURNS TABLE(admin_id uuid, email text, full_name text, role text, is_active boolean, needs_password_change boolean, login_attempts integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.update_admin_password(admin_id uuid, new_password_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to update passwords
  IF NOT public.is_admin_secure() THEN
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

CREATE OR REPLACE FUNCTION public.create_admin_user(input_email text, input_full_name text, input_password_hash text, input_role text DEFAULT 'admin'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  -- Only existing admins can create new admin users
  IF NOT public.is_admin_secure() THEN
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

CREATE OR REPLACE FUNCTION public.unlock_admin_account(admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can unlock accounts
  IF NOT public.is_admin_secure() THEN
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_event_url_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.url_slug IS NULL OR NEW.url_slug = '' THEN
    NEW.url_slug = NEW.event_type::text;
  END IF;
  RETURN NEW;
END;
$$;