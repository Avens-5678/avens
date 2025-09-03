-- Remove unnecessary event types from events table
DELETE FROM events WHERE event_type IN (
  'anniversary',
  'birthday', 
  'corporate',
  'government',
  'social'
);

-- Also remove any portfolio items that might be linked to these event types
DELETE FROM portfolio WHERE event_id IN (
  SELECT id FROM events WHERE event_type IN (
    'anniversary',
    'birthday',
    'corporate', 
    'government',
    'social'
  )
);

-- Keep only the main event categories that are properly formatted