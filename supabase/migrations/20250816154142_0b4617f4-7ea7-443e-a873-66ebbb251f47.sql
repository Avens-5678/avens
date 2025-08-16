-- Fix form_submissions RLS policy to allow public submissions
DROP POLICY IF EXISTS "Allow public form submissions" ON form_submissions;

-- Create proper policy for public form submissions
CREATE POLICY "Allow public form submissions" 
ON form_submissions 
FOR INSERT 
WITH CHECK (true);

-- Update event type enum to include government
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'government';