-- Change rental_id from UUID to TEXT to allow multiple comma-separated IDs
ALTER TABLE form_submissions ALTER COLUMN rental_id TYPE TEXT;