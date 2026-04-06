-- Event Essentials vertical: Blinkit-style quick commerce for party supplies
-- Completely separate from the rental system (vendor_inventory, rental_orders)

-- ============================================================
-- Essential Categories
-- ============================================================
CREATE TABLE IF NOT EXISTS essential_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Essential Products (purchasable items)
-- ============================================================
CREATE TABLE IF NOT EXISTS essential_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES essential_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price > 0),
  compare_price NUMERIC,
  stock_count INTEGER DEFAULT 0 CHECK (stock_count >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  min_order_qty INTEGER DEFAULT 1,
  max_order_qty INTEGER DEFAULT 50,
  images TEXT[] DEFAULT '{}',
  weight_grams INTEGER,
  tags TEXT[] DEFAULT '{}',
  sku TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  avg_rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Essential Orders (separate from rental_orders)
-- ============================================================
CREATE TABLE IF NOT EXISTS essential_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  vendor_id UUID REFERENCES auth.users(id) NOT NULL,
  items JSONB NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'standard'
    CHECK (delivery_type IN ('express', 'standard', 'scheduled')),
  delivery_address TEXT NOT NULL,
  delivery_lat NUMERIC,
  delivery_lng NUMERIC,
  delivery_instructions TEXT,
  scheduled_delivery_at TIMESTAMPTZ,
  estimated_delivery_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN (
    'placed', 'confirmed', 'packing', 'ready_for_pickup',
    'out_for_delivery', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded'
  )),
  payment_method TEXT DEFAULT 'online' CHECK (payment_method IN (
    'online', 'cod'
  )),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  vendor_accepted_at TIMESTAMPTZ,
  packed_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Delivery Tracking (real-time updates)
-- ============================================================
CREATE TABLE IF NOT EXISTS essential_delivery_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES essential_orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  lat NUMERIC,
  lng NUMERIC,
  delivery_partner_name TEXT,
  delivery_partner_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Theme Bundles (curated party packs)
-- ============================================================
CREATE TABLE IF NOT EXISTS essential_bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  guest_count INTEGER,
  bundle_price NUMERIC NOT NULL,
  original_price NUMERIC,
  items JSONB NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  total_sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Customer Addresses (saved for quick reorder)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT DEFAULT 'Home',
  address_line TEXT NOT NULL,
  landmark TEXT,
  lat NUMERIC,
  lng NUMERIC,
  city TEXT,
  pincode TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_essential_products_vendor ON essential_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_essential_products_category ON essential_products(category_id);
CREATE INDEX IF NOT EXISTS idx_essential_products_active ON essential_products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_essential_products_featured ON essential_products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_essential_orders_customer ON essential_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_essential_orders_vendor ON essential_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_essential_orders_status ON essential_orders(status);
CREATE INDEX IF NOT EXISTS idx_essential_delivery_order ON essential_delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user ON customer_addresses(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE essential_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE essential_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE essential_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE essential_delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE essential_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Categories
CREATE POLICY "Anyone can view categories" ON essential_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON essential_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products
CREATE POLICY "Anyone can view active products" ON essential_products FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors can manage own products" ON essential_products FOR ALL USING (vendor_id = auth.uid());
CREATE POLICY "Admin can manage all products" ON essential_products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders
CREATE POLICY "Customers view own orders" ON essential_orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Vendors view assigned orders" ON essential_orders FOR SELECT USING (vendor_id = auth.uid());
CREATE POLICY "Customers can create orders" ON essential_orders FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Vendors can update own orders" ON essential_orders FOR UPDATE USING (vendor_id = auth.uid());
CREATE POLICY "Admin can view all orders" ON essential_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can update all orders" ON essential_orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Delivery tracking
CREATE POLICY "Order parties view tracking" ON essential_delivery_tracking FOR SELECT USING (
  EXISTS (SELECT 1 FROM essential_orders WHERE id = order_id AND (customer_id = auth.uid() OR vendor_id = auth.uid()))
);
CREATE POLICY "Vendors can insert tracking" ON essential_delivery_tracking FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM essential_orders WHERE id = order_id AND vendor_id = auth.uid())
);
CREATE POLICY "Admin can manage tracking" ON essential_delivery_tracking FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bundles
CREATE POLICY "Anyone can view bundles" ON essential_bundles FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage bundles" ON essential_bundles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Customer addresses
CREATE POLICY "Users manage own addresses" ON customer_addresses FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE essential_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE essential_delivery_tracking;

-- ============================================================
-- Order number generator (EE-YYYYMMDD-XXXX)
-- ============================================================
CREATE OR REPLACE FUNCTION generate_essential_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'EE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_essential_order_number
  BEFORE INSERT ON essential_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_essential_order_number();

-- ============================================================
-- Auto-update stock on order status change
-- ============================================================
CREATE OR REPLACE FUNCTION update_essential_stock()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- Deduct stock when order is confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status = 'placed') THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) AS elem
    LOOP
      UPDATE essential_products
      SET stock_count = stock_count - (item.elem->>'quantity')::INTEGER,
          total_sold = total_sold + (item.elem->>'quantity')::INTEGER,
          updated_at = now()
      WHERE id = (item.elem->>'product_id')::UUID
        AND stock_count >= (item.elem->>'quantity')::INTEGER;
    END LOOP;
  END IF;

  -- Restore stock when order is cancelled
  IF NEW.status = 'cancelled' AND OLD.status IN ('placed', 'confirmed') THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) AS elem
    LOOP
      UPDATE essential_products
      SET stock_count = stock_count + (item.elem->>'quantity')::INTEGER,
          total_sold = GREATEST(0, total_sold - (item.elem->>'quantity')::INTEGER),
          updated_at = now()
      WHERE id = (item.elem->>'product_id')::UUID;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER essential_stock_trigger
  AFTER UPDATE ON essential_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_essential_stock();

-- ============================================================
-- Seed categories
-- ============================================================
INSERT INTO essential_categories (name, slug, icon_name, display_order) VALUES
  ('Balloons', 'balloons', 'circle-dot', 1),
  ('Decorations', 'decorations', 'sparkles', 2),
  ('Party Poppers', 'party-poppers', 'party-popper', 3),
  ('Candles & Cake', 'candles-cake', 'flame', 4),
  ('Tableware', 'tableware', 'utensils', 5),
  ('Theme Kits', 'theme-kits', 'package', 6),
  ('Photo Props', 'photo-props', 'camera', 7),
  ('Gift Wrap', 'gift-wrap', 'gift', 8),
  ('Return Gifts', 'return-gifts', 'heart', 9);
