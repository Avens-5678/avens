-- Temporarily disable RLS to fix the issue
ALTER TABLE form_submissions DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS 
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "public_insert_form_submissions" ON form_submissions;
DROP POLICY IF EXISTS "admin_read_form_submissions" ON form_submissions;
DROP POLICY IF EXISTS "admin_update_form_submissions" ON form_submissions;
DROP POLICY IF EXISTS "no_delete_form_submissions" ON form_submissions;

-- Create a simple INSERT policy that works for anonymous users
CREATE POLICY "allow_insert_form_submissions" 
ON form_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow admins to read all submissions
CREATE POLICY "admin_can_read_submissions" 
ON form_submissions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Allow admins to update submissions
CREATE POLICY "admin_can_update_submissions" 
ON form_submissions 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Prevent deletion of submissions
CREATE POLICY "prevent_delete_submissions" 
ON form_submissions 
FOR DELETE 
USING (false);