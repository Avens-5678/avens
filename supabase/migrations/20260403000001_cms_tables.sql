-- ═══════════════════════════════════════════════════════════════
-- CMS Database Tables Migration
-- Extends promo_banners + site_settings, creates coupons + featured
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────
-- 1. Extend promo_banners with missing columns
-- ───────────────────────────────────────────
ALTER TABLE public.promo_banners
  ADD COLUMN IF NOT EXISTS link_url TEXT,
  ADD COLUMN IF NOT EXISTS placement TEXT DEFAULT 'hero'
    CHECK (placement IN ('hero','category','popup','sidebar')),
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS device TEXT DEFAULT 'both'
    CHECK (device IN ('mobile','desktop','both'));

-- ───────────────────────────────────────────
-- 2. Extend site_settings with key/value JSONB pattern
-- ───────────────────────────────────────────
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS key TEXT,
  ADD COLUMN IF NOT EXISTS value JSONB,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add unique constraint on key (only if key column didn't exist before)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_key_unique'
  ) THEN
    ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_key_unique UNIQUE (key);
  END IF;
END $$;

-- Insert default settings rows (skip if key already exists)
INSERT INTO public.site_settings (key, value, description)
VALUES
  ('announcement_bar', '{"text": "", "is_active": false, "bg_color": "#1D9E75", "text_color": "#ffffff"}'::jsonb, 'Top announcement bar on website'),
  ('seo_defaults', '{"title": "Evnting - Event Rental Marketplace", "description": "Book event equipment, venues and crew", "og_image": ""}'::jsonb, 'Default SEO meta tags'),
  ('contact_info', '{"phone": "", "email": "", "whatsapp": "", "address": ""}'::jsonb, 'Company contact information'),
  ('social_links', '{"instagram": "", "facebook": "", "youtube": "", "twitter": ""}'::jsonb, 'Social media profile links')
ON CONFLICT (key) DO NOTHING;

-- ───────────────────────────────────────────
-- 3. Create discount_coupons
-- ───────────────────────────────────────────
CREATE TABLE public.discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','flat')),
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  applicable_categories TEXT[],
  applicable_vendor_ids UUID[],
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- Everyone can read active coupons (needed for validation at checkout)
CREATE POLICY "Public can read active coupons"
  ON public.discount_coupons FOR SELECT
  USING (true);

-- Only admins can manage coupons
CREATE POLICY "Admins manage coupons"
  ON public.discount_coupons FOR INSERT
  WITH CHECK (public.is_admin_secure());

CREATE POLICY "Admins update coupons"
  ON public.discount_coupons FOR UPDATE
  USING (public.is_admin_secure());

CREATE POLICY "Admins delete coupons"
  ON public.discount_coupons FOR DELETE
  USING (public.is_admin_secure());

-- ───────────────────────────────────────────
-- 4. Create coupon_usage
-- ───────────────────────────────────────────
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.discount_coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID,
  order_type TEXT CHECK (order_type IS NULL OR order_type IN ('rental','service','venue')),
  discount_applied NUMERIC NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own usage
CREATE POLICY "Users insert own coupon usage"
  ON public.coupon_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users see their own usage, admins see all
CREATE POLICY "Users see own usage or admin sees all"
  ON public.coupon_usage FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_secure());

-- ───────────────────────────────────────────
-- 5. Create featured_items
-- ───────────────────────────────────────────
CREATE TABLE public.featured_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('product','vendor','category')),
  placement TEXT NOT NULL CHECK (placement IN ('homepage','category_page','search_boost')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.featured_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read (website needs to display featured items)
CREATE POLICY "Public can read featured items"
  ON public.featured_items FOR SELECT
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins manage featured items"
  ON public.featured_items FOR INSERT
  WITH CHECK (public.is_admin_secure());

CREATE POLICY "Admins update featured items"
  ON public.featured_items FOR UPDATE
  USING (public.is_admin_secure());

CREATE POLICY "Admins delete featured items"
  ON public.featured_items FOR DELETE
  USING (public.is_admin_secure());

-- ───────────────────────────────────────────
-- 6. RLS on existing tables (if not already set)
-- ───────────────────────────────────────────

-- promo_banners: ensure public read + admin write
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promo_banners' AND policyname = 'Public can read banners'
  ) THEN
    CREATE POLICY "Public can read banners"
      ON public.promo_banners FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promo_banners' AND policyname = 'Admins manage banners'
  ) THEN
    CREATE POLICY "Admins manage banners"
      ON public.promo_banners FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());
  END IF;
END $$;

-- site_settings: ensure public read + admin write
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public can read settings'
  ) THEN
    CREATE POLICY "Public can read settings"
      ON public.site_settings FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Admins manage settings'
  ) THEN
    CREATE POLICY "Admins manage settings"
      ON public.site_settings FOR ALL USING (public.is_admin_secure()) WITH CHECK (public.is_admin_secure());
  END IF;
END $$;

-- ───────────────────────────────────────────
-- 7. Indexes
-- ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON public.discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_active ON public.discount_coupons(is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON public.coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_featured_items_placement ON public.featured_items(placement, is_active);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);
