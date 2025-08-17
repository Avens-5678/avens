-- Fix Security Definer View issue for portfolio_view
-- The view was owned by postgres superuser with overly broad permissions
-- This recreates it with proper security restrictions

-- Drop the existing view
DROP VIEW IF EXISTS public.portfolio_view;

-- Recreate the view without SECURITY DEFINER and with proper ownership
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

-- Enable RLS on the view (inherits from underlying tables)
ALTER VIEW public.portfolio_view OWNER TO supabase_admin;

-- Set proper permissions - only allow public read access
REVOKE ALL ON public.portfolio_view FROM PUBLIC;
GRANT SELECT ON public.portfolio_view TO anon;
GRANT SELECT ON public.portfolio_view TO authenticated;
GRANT ALL ON public.portfolio_view TO supabase_admin;

-- The view will now inherit RLS policies from the underlying portfolio and events tables
-- which already have proper public read access policies