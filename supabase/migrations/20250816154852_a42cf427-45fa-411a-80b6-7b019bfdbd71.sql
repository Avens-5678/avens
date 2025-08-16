-- Drop all existing form_submissions policies
DROP POLICY IF EXISTS "Allow public form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Deny public update access to form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Deny public delete access to form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Admins can view all form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Admins can update form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Deny public read access to form submissions" ON form_submissions;

-- Create new comprehensive policies for form_submissions
-- Allow anyone to insert form submissions (public forms)
CREATE POLICY "Enable public form submissions" 
ON form_submissions 
FOR INSERT 
TO public
WITH CHECK (true);

-- Allow admins to read all form submissions
CREATE POLICY "Enable admin read access" 
ON form_submissions 
FOR SELECT 
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Allow admins to update form submissions
CREATE POLICY "Enable admin update access" 
ON form_submissions 
FOR UPDATE 
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Deny public read/update/delete access
CREATE POLICY "Deny public read access" 
ON form_submissions 
FOR SELECT 
TO public
USING (false);

CREATE POLICY "Deny public update access" 
ON form_submissions 
FOR UPDATE 
TO public
USING (false);

CREATE POLICY "Deny public delete access" 
ON form_submissions 
FOR DELETE 
TO public
USING (false);