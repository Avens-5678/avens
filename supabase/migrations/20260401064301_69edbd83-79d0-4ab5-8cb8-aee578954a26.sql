
-- 1. Create pricing_rules table for tiered markup
CREATE TABLE public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key text NOT NULL UNIQUE,
  tier_label text NOT NULL,
  markup_type text NOT NULL DEFAULT 'percentage' CHECK (markup_type IN ('percentage', 'flat')),
  markup_min numeric NOT NULL DEFAULT 0,
  markup_max numeric NOT NULL DEFAULT 0,
  markup_default numeric NOT NULL DEFAULT 0,
  applies_to text NOT NULL DEFAULT 'rental' CHECK (applies_to IN ('rental', 'crew', 'venue', 'logistics')),
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active pricing rules" ON public.pricing_rules FOR SELECT TO public
  USING (is_active = true);

-- 2. Add markup_tier to rentals table
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS markup_tier text DEFAULT 'mid';

-- 3. Add markup_tier to vendor_inventory table
ALTER TABLE public.vendor_inventory ADD COLUMN IF NOT EXISTS markup_tier text DEFAULT 'mid';

-- 4. Seed default pricing tiers
INSERT INTO public.pricing_rules (tier_key, tier_label, markup_type, markup_min, markup_max, markup_default, applies_to, description, display_order) VALUES
  ('micro', 'Micro & Commodity Items', 'percentage', 40, 50, 45, 'rental', 'Plastic chairs, basic tables, cutlery, standard carpeting. High-margin, low-cost items.', 1),
  ('mid', 'Mid-Ticket Infrastructure', 'percentage', 20, 25, 22, 'rental', 'Banquet sofas, PA systems, basic lighting, standard trussing.', 2),
  ('high', 'High-Ticket / Tech Rentals', 'percentage', 10, 12, 11, 'rental', 'Large LED screens, generators, line-array sound, luxury AC tents.', 3),
  ('logistics', 'Logistics (Transport & Manpower)', 'percentage', 0, 5, 3, 'logistics', 'Transport tiers and loader costs passed at near-cost.', 4),
  ('commodity_crew', 'Commodity Crew (Flat Rate)', 'flat', 200, 300, 250, 'crew', 'Waitstaff, bouncers, valet. Flat ₹250 arbitrage per head per shift.', 5),
  ('creative_low', 'Creative Crew (Under ₹15K)', 'percentage', 14, 16, 15, 'crew', 'Photographers, decorators — packages under ₹15,000.', 6),
  ('creative_mid', 'Creative Crew (₹15K–₹50K)', 'percentage', 11, 13, 12, 'crew', 'Mid-range creative professional packages.', 7),
  ('creative_high', 'Creative Crew (Over ₹50K)', 'percentage', 8, 10, 9, 'crew', 'Premium creative packages above ₹50,000.', 8);

-- 5. Update logistics_config to keep transport/manpower markup separate
-- (keeping existing table, just noting logistics markup is now in pricing_rules)
