-- Add policy to allow public email validation for login
CREATE POLICY "Allow public email validation for login"
ON public.admin_users
FOR SELECT
USING (true);