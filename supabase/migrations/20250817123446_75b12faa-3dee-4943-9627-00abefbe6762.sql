-- Step 1: Drop the portfolio_view that depends on event_type column
DROP VIEW IF EXISTS portfolio_view;

-- Step 2: Change event_type column from enum to text to allow custom event types
ALTER TABLE events 
ALTER COLUMN event_type TYPE text 
USING event_type::text;

-- Step 3: Drop the enum type since we're no longer using it
DROP TYPE IF EXISTS event_type;

-- Step 4: Recreate the portfolio_view
CREATE VIEW portfolio_view AS
SELECT p.id,
    p.event_id,
    p.title,
    p.image_url,
    p.is_before_after,
    p.is_before,
    p.display_order,
    p.tag,
    p.album_url,
    e.title AS event_title,
    e.event_type,
    e.location,
    e.description
FROM (portfolio p
     JOIN events e ON ((p.event_id = e.id)));