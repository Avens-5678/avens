-- Set a simple password that definitely works
UPDATE public.admin_users 
SET password_hash = 'password123'
WHERE email = 'raghuram2087@gmail.com';