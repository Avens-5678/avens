-- Delete unwanted event types and their associated data
-- First delete portfolio items for events we're removing
DELETE FROM portfolio 
WHERE event_id IN (
  SELECT id FROM events 
  WHERE event_type IN ('anniversary', 'wedding', 'other')
);

-- Delete the unwanted events
DELETE FROM events 
WHERE event_type IN ('anniversary', 'wedding', 'other');

-- Insert missing event types that should be kept
INSERT INTO events (event_type, title, description, process_description, is_active)
VALUES 
  ('government', 'Government Events', 'Professional event management for government functions, ceremonies, and official gatherings.', 'We ensure protocol compliance and flawless execution for all government occasions.', true),
  ('equipment', 'Equipment Rental', 'Professional equipment rental services for events of all sizes.', 'From lighting to sound systems, we provide high-quality equipment for your event needs.', true)
ON CONFLICT (event_type) DO NOTHING;