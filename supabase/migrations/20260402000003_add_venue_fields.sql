-- ============================================================
-- Add venue-specific fields to rentals and vendor_inventory
-- New columns:
--   venue_category: banquet_hall, farmhouse, rooftop, resort,
--                   convention_centre, garden
--   site_visit_price: deposit for physical site visit (default 499)
--   hold_24hr_price: 24-hour date hold fee (default 2000)
-- Also adds razorpay_payment_id tracking to venue_holds and
-- site_visit_requests for payment reconciliation.
-- ============================================================

ALTER TABLE public.rentals
  ADD COLUMN IF NOT EXISTS venue_category TEXT,
  ADD COLUMN IF NOT EXISTS site_visit_price NUMERIC DEFAULT 499,
  ADD COLUMN IF NOT EXISTS hold_24hr_price NUMERIC DEFAULT 2000;

ALTER TABLE public.vendor_inventory
  ADD COLUMN IF NOT EXISTS venue_category TEXT,
  ADD COLUMN IF NOT EXISTS site_visit_price NUMERIC DEFAULT 499,
  ADD COLUMN IF NOT EXISTS hold_24hr_price NUMERIC DEFAULT 2000;

ALTER TABLE public.venue_holds
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

ALTER TABLE public.site_visit_requests
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

COMMENT ON COLUMN public.rentals.venue_category IS 'banquet_hall, farmhouse, rooftop, resort, convention_centre, garden';
COMMENT ON COLUMN public.vendor_inventory.venue_category IS 'banquet_hall, farmhouse, rooftop, resort, convention_centre, garden';
