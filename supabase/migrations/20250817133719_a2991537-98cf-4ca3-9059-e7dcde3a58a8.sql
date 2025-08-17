-- Reset admin credentials with simple password
UPDATE public.admin_users 
SET 
  password_hash = 'admin123',
  role = 'super_admin',
  login_attempts = 0,
  account_locked_until = NULL,
  last_failed_login = NULL,
  is_active = true,
  updated_at = now()
WHERE email = 'admin@avensevents.com';

-- If no admin exists, create one
INSERT INTO public.admin_users (
  email, 
  full_name, 
  password_hash, 
  role, 
  is_active,
  password_changed_at
)
VALUES (
  'admin@avensevents.com',
  'Super Admin',
  'admin123',
  'super_admin',
  true,
  now()
)
ON CONFLICT (email) DO NOTHING;