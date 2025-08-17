-- Let's check the current auth user and reset their password
-- We need to update the auth.users table directly with a new password
UPDATE auth.users 
SET 
  encrypted_password = crypt('password123', gen_salt('bf')),
  updated_at = now()
WHERE email = 'raghuram2087@gmail.com';