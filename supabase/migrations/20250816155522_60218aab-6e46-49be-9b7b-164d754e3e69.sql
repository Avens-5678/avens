-- Drop ALL existing policies on form_submissions
DROP POLICY IF EXISTS "Enable public form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Enable admin read access" ON form_submissions;
DROP POLICY IF EXISTS "Enable admin update access" ON form_submissions;
DROP POLICY IF EXISTS "Deny public read access" ON form_submissions;
DROP POLICY IF EXISTS "Deny public update access" ON form_submissions;
DROP POLICY IF EXISTS "Deny public delete access" ON form_submissions;

-- Create simple, working policies
-- Allow anyone to insert form submissions (this is what we need for public forms)
CREATE POLICY "public_insert_form_submissions" 
ON form_submissions 
FOR INSERT 
WITH CHECK (true);

-- Only admins can read form submissions
CREATE POLICY "admin_read_form_submissions" 
ON form_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Only admins can update form submissions  
CREATE POLICY "admin_update_form_submissions" 
ON form_submissions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- No one can delete form submissions (preserve all data)
CREATE POLICY "no_delete_form_submissions" 
ON form_submissions 
FOR DELETE 
USING (false);