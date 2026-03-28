
-- Phase 1: Add venue-specific columns to vendor_inventory
ALTER TABLE public.vendor_inventory
  ADD COLUMN IF NOT EXISTS venue_type text,
  ADD COLUMN IF NOT EXISTS min_capacity integer,
  ADD COLUMN IF NOT EXISTS max_capacity integer,
  ADD COLUMN IF NOT EXISTS num_halls integer,
  ADD COLUMN IF NOT EXISTS seating_types text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS pricing_packages jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS weekday_price numeric,
  ADD COLUMN IF NOT EXISTS weekend_price numeric,
  ADD COLUMN IF NOT EXISTS catering_type text,
  ADD COLUMN IF NOT EXISTS parking_available boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS rooms_available integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS av_equipment boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancellation_policy text,
  ADD COLUMN IF NOT EXISTS advance_amount numeric,
  ADD COLUMN IF NOT EXISTS refund_rules text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS slot_types text[] DEFAULT '{}'::text[];

-- Phase 1: Add same columns to rentals table
ALTER TABLE public.rentals
  ADD COLUMN IF NOT EXISTS venue_type text,
  ADD COLUMN IF NOT EXISTS min_capacity integer,
  ADD COLUMN IF NOT EXISTS max_capacity integer,
  ADD COLUMN IF NOT EXISTS num_halls integer,
  ADD COLUMN IF NOT EXISTS seating_types text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS pricing_packages jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS weekday_price numeric,
  ADD COLUMN IF NOT EXISTS weekend_price numeric,
  ADD COLUMN IF NOT EXISTS catering_type text,
  ADD COLUMN IF NOT EXISTS parking_available boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS rooms_available integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS av_equipment boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancellation_policy text,
  ADD COLUMN IF NOT EXISTS advance_amount numeric,
  ADD COLUMN IF NOT EXISTS refund_rules text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS slot_types text[] DEFAULT '{}'::text[];

-- Phase 2: Expand vendor_availability with slot system
ALTER TABLE public.vendor_availability
  ADD COLUMN IF NOT EXISTS slot text DEFAULT 'full_day',
  ADD COLUMN IF NOT EXISTS booking_order_id uuid,
  ADD COLUMN IF NOT EXISTS is_auto_blocked boolean DEFAULT false;

-- Add unique constraint for slot-based booking (prevent double booking)
ALTER TABLE public.vendor_availability
  ADD CONSTRAINT vendor_availability_unique_slot UNIQUE (inventory_item_id, date, slot);

-- Phase 3: Add vendor direct order columns to rental_orders
ALTER TABLE public.rental_orders
  ADD COLUMN IF NOT EXISTS is_vendor_direct boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_source text DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS is_offline boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vendor_inventory_item_id uuid;

-- Phase 4: Create vendor_metrics table
CREATE TABLE IF NOT EXISTS public.vendor_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL UNIQUE,
  avg_rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  avg_response_time_hours numeric DEFAULT 0,
  booking_success_rate numeric DEFAULT 0,
  is_sponsored boolean DEFAULT false,
  rank_score numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.vendor_metrics ENABLE ROW LEVEL SECURITY;

-- RLS for vendor_metrics
CREATE POLICY "Public can read vendor metrics" ON public.vendor_metrics FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage vendor metrics" ON public.vendor_metrics FOR ALL TO authenticated USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());
CREATE POLICY "Vendors can view own metrics" ON public.vendor_metrics FOR SELECT TO authenticated USING (vendor_id = auth.uid());

-- Auto-block trigger: when rental_orders status changes to 'confirmed', insert into vendor_availability
CREATE OR REPLACE FUNCTION public.auto_block_on_order_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status <> 'confirmed') THEN
    -- Auto-block the date for the vendor
    IF NEW.assigned_vendor_id IS NOT NULL AND NEW.event_date IS NOT NULL THEN
      INSERT INTO public.vendor_availability (vendor_id, inventory_item_id, date, slot, is_booked, is_auto_blocked, booking_order_id, notes)
      VALUES (
        NEW.assigned_vendor_id,
        NEW.vendor_inventory_item_id,
        NEW.event_date,
        'full_day',
        true,
        true,
        NEW.id,
        'Auto-blocked from order: ' || NEW.title
      )
      ON CONFLICT (inventory_item_id, date, slot) DO UPDATE SET
        is_booked = true,
        is_auto_blocked = true,
        booking_order_id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_block_on_confirmed
  AFTER UPDATE ON public.rental_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_block_on_order_confirmed();

-- Rank calculation function
CREATE OR REPLACE FUNCTION public.calculate_vendor_rank_score(
  _avg_rating numeric,
  _booking_success_rate numeric,
  _avg_response_time_hours numeric,
  _is_sponsored boolean
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 
    (COALESCE(_avg_rating, 0) * 0.3) +
    (COALESCE(_booking_success_rate, 0) * 0.25) +
    (CASE WHEN COALESCE(_avg_response_time_hours, 999) < 1 THEN 1.0
          WHEN COALESCE(_avg_response_time_hours, 999) < 4 THEN 0.8
          WHEN COALESCE(_avg_response_time_hours, 999) < 12 THEN 0.5
          ELSE 0.2 END * 0.2) +
    (CASE WHEN _is_sponsored THEN 1.0 ELSE 0.0 END * 0.1)
$$;
