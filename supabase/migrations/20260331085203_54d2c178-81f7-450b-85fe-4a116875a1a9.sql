
-- Phase 1: Add columns to vendor_inventory
ALTER TABLE public.vendor_inventory 
  ADD COLUMN IF NOT EXISTS vendor_base_price numeric,
  ADD COLUMN IF NOT EXISTS labor_weight integer NOT NULL DEFAULT 1;

-- Add warehouse_pincode to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS warehouse_pincode text;

-- Add logistics fee columns to rental_orders
ALTER TABLE public.rental_orders
  ADD COLUMN IF NOT EXISTS manpower_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transport_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vendor_payout numeric DEFAULT 0;

-- Create transport_tiers table
CREATE TABLE IF NOT EXISTS public.transport_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_km integer NOT NULL DEFAULT 0,
  max_km integer,
  base_fee numeric NOT NULL,
  per_km_fee numeric DEFAULT 0,
  vehicle_type text DEFAULT 'Tata Ace',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.transport_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read transport tiers" ON public.transport_tiers
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage transport tiers" ON public.transport_tiers
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed default transport tiers
INSERT INTO public.transport_tiers (min_km, max_km, base_fee, per_km_fee, vehicle_type) VALUES
  (0, 5, 800, 0, 'Tata Ace'),
  (5, 15, 1500, 0, 'Tata Ace'),
  (15, NULL, 1500, 50, 'Tata Ace');

-- Create logistics_config table
CREATE TABLE IF NOT EXISTS public.logistics_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  markup_percent numeric NOT NULL DEFAULT 30,
  labor_units_per_loader integer NOT NULL DEFAULT 100,
  loader_daily_rate numeric NOT NULL DEFAULT 600,
  min_booking_hours integer NOT NULL DEFAULT 48,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.logistics_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read logistics config" ON public.logistics_config
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage logistics config" ON public.logistics_config
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed default config
INSERT INTO public.logistics_config DEFAULT VALUES;
