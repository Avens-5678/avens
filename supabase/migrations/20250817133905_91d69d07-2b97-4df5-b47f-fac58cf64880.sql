-- Create a proper admin user with real email for Supabase Auth
-- First, let's update the existing admin with a real email
UPDATE public.admin_users 
SET 
  email = 'raghuram2087@gmail.com',  -- Use the email that's already logged in
  password_hash = 'admin123',
  role = 'super_admin',
  login_attempts = 0,
  account_locked_until = NULL,
  last_failed_login = NULL,
  is_active = true,
  updated_at = now()
WHERE email = 'admin@avensevents.com';

-- Also create an entry for the current user ID if it doesn't exist
INSERT INTO public.admin_users (
  id,
  email, 
  full_name, 
  password_hash, 
  role, 
  is_active,
  password_changed_at
)
VALUES (
  '4dbea7c7-9a60-4221-8fda-9b38a0589f97',  -- Current user ID from network logs
  'raghuram2087@gmail.com',
  'Admin User',
  'admin123',
  'super_admin',
  true,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();