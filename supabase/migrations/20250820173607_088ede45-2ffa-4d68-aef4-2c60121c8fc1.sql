-- Add show_on_home column to portfolio table
ALTER TABLE portfolio ADD COLUMN show_on_home boolean DEFAULT true;

-- Update existing records to have show_on_home = true by default
UPDATE portfolio SET show_on_home = true WHERE show_on_home IS NULL;