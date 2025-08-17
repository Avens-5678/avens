-- Check current event_type enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'event_type'
);

-- Change event_type column from enum to text to allow custom event types
ALTER TABLE events 
ALTER COLUMN event_type TYPE text 
USING event_type::text;

-- Drop the enum type since we're no longer using it
DROP TYPE IF EXISTS event_type;