-- Fix Security Definer View issue for portfolio_view
-- Simply recreate the view to remove any security definer properties

-- Drop the existing view
DROP VIEW IF EXISTS public.portfolio_view;

-- Recreate the view without any security definer properties
-- By default, views use SECURITY INVOKER (caller's permissions)
CREATE VIEW public.portfolio_view AS
SELECT 
  p.id,
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
FROM portfolio p
JOIN events e ON p.event_id = e.id;

-- Ensure proper permissions for read access
GRANT SELECT ON public.portfolio_view TO anon;
GRANT SELECT ON public.portfolio_view TO authenticated;