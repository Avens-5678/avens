-- Add explicit deny policies for public access to admin_users table
-- This ensures admin credentials are fully protected from unauthorized access

-- Add explicit deny policy for public read access
CREATE POLICY "Deny public read access to admin users"
ON public.admin_users
FOR SELECT
TO public
USING (false);

-- Add explicit deny policy for public insert access
CREATE POLICY "Deny public insert access to admin users"
ON public.admin_users
FOR INSERT
TO public
WITH CHECK (false);

-- Add explicit deny policy for public update access (additional security layer)
CREATE POLICY "Deny public update access to admin users"
ON public.admin_users
FOR UPDATE
TO public
USING (false);

-- Add explicit deny policy for public delete access
CREATE POLICY "Deny public delete access to admin users"
ON public.admin_users
FOR DELETE
TO public
USING (false);