-- Let's check if the user exists in Supabase Auth and create them if needed
-- First, let's see if we can find the user in auth.users
SELECT email, id, created_at FROM auth.users WHERE email = 'raghuram2087@gmail.com';