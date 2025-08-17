-- Fix Security Definer View issue for portfolio_view
-- Recreate the view with proper security without changing ownership

-- Drop the existing view
DROP VIEW IF EXISTS public.portfolio_view;

-- Recreate the view with explicit security context
-- This ensures it uses the calling user's permissions, not the creator's
CREATE VIEW public.portfolio_view 
SECURITY INVOKER
AS
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

-- Grant appropriate permissions
GRANT SELECT ON public.portfolio_view TO anon;
GRANT SELECT ON public.portfolio_view TO authenticated;

-- The view will now properly inherit RLS policies from underlying tables
-- and use the calling user's permissions instead of the creator's