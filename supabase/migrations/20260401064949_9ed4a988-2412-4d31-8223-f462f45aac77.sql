
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add lat/lng to profiles for vendor warehouse location
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS warehouse_lat double precision,
  ADD COLUMN IF NOT EXISTS warehouse_lng double precision;

-- Add venue lat/lng to rental_orders for client delivery location
ALTER TABLE public.rental_orders
  ADD COLUMN IF NOT EXISTS venue_lat double precision,
  ADD COLUMN IF NOT EXISTS venue_lng double precision,
  ADD COLUMN IF NOT EXISTS venue_pincode text;

-- Add volume_units to vendor_inventory for volumetric vehicle matching
ALTER TABLE public.vendor_inventory
  ADD COLUMN IF NOT EXISTS volume_units integer NOT NULL DEFAULT 1;

-- Add volume_units to rentals table too (for admin-managed items)
ALTER TABLE public.rentals
  ADD COLUMN IF NOT EXISTS volume_units integer NOT NULL DEFAULT 1;

-- Drop old transport_tiers and recreate with volumetric vehicle matching
DELETE FROM public.transport_tiers;

INSERT INTO public.transport_tiers (id, min_km, max_km, base_fee, per_km_fee, vehicle_type) VALUES
  (gen_random_uuid(), 0, 5, 50, 0, 'Two-Wheeler'),
  (gen_random_uuid(), 5, 15, 50, 10, 'Two-Wheeler'),
  (gen_random_uuid(), 15, NULL, 50, 15, 'Two-Wheeler');

-- Create vehicle_tiers table for volumetric matching
CREATE TABLE IF NOT EXISTS public.vehicle_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type text NOT NULL,
  min_volume_units integer NOT NULL DEFAULT 0,
  max_volume_units integer,
  base_fare numeric NOT NULL DEFAULT 0,
  per_km_rate numeric NOT NULL DEFAULT 0,
  night_surge_multiplier numeric NOT NULL DEFAULT 1.0,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.vehicle_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vehicle_tiers" ON public.vehicle_tiers
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage vehicle_tiers" ON public.vehicle_tiers
  FOR ALL TO authenticated USING (public.is_admin());

INSERT INTO public.vehicle_tiers (vehicle_type, min_volume_units, max_volume_units, base_fare, per_km_rate, night_surge_multiplier, display_order) VALUES
  ('Two-Wheeler', 0, 5, 50, 5, 1.5, 1),
  ('Tata Ace', 6, 150, 800, 25, 1.5, 2),
  ('Bolero Pickup', 151, 500, 1500, 30, 1.5, 3),
  ('14-Wheeler DCM', 501, NULL, 3500, 40, 1.5, 4);
