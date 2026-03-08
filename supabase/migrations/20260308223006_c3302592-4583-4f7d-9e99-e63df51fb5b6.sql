
-- Promo banners table
CREATE TABLE public.promo_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  cta_text text DEFAULT 'Shop Now',
  gradient_from text DEFAULT '#7c3aed',
  gradient_to text DEFAULT '#a855f7',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Trust strip items table
CREATE TABLE public.trust_strip_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_name text NOT NULL DEFAULT 'Shield',
  text text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_strip_items ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public can read active promo banners" ON public.promo_banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active trust strip items" ON public.trust_strip_items FOR SELECT USING (is_active = true);

-- Admin CRUD
CREATE POLICY "Admins can manage promo banners" ON public.promo_banners FOR ALL USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can manage trust strip items" ON public.trust_strip_items FOR ALL USING (is_admin_secure()) WITH CHECK (is_admin_secure());

-- Seed trust strip defaults
INSERT INTO public.trust_strip_items (icon_name, text, display_order) VALUES
  ('Truck', 'Free Delivery above ₹10,000', 1),
  ('Shield', 'Trusted by 500+ Events', 2),
  ('Headphones', '24/7 Expert Support', 3),
  ('RotateCcw', 'Easy Returns & Refunds', 4);

-- Seed promo banners
INSERT INTO public.promo_banners (title, subtitle, cta_text, gradient_from, gradient_to, display_order) VALUES
  ('Mega Event Sale', 'Up to 40% off on Premium Structures & Hangars', 'Shop Now', '#7c3aed', '#a855f7', 1),
  ('Wedding Season Special', 'Exclusive décor packages starting ₹15,000', 'Explore Collection', '#be185d', '#ec4899', 2),
  ('Corporate Event Kits', 'Sound + Lighting + Stage — bundled & ready to go', 'View Bundles', '#1e293b', '#475569', 3),
  ('New Arrivals 🔥', 'LED Walls, Hydraulic Stages & AC Domes now available', 'See What''s New', '#059669', '#10b981', 4);
