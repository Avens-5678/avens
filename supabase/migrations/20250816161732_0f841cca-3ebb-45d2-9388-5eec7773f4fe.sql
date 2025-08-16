-- Drop the foreign key constraint first
ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_rental_id_fkey;

-- Change rental_id from UUID to TEXT to allow multiple comma-separated IDs
ALTER TABLE form_submissions ALTER COLUMN rental_id TYPE TEXT;