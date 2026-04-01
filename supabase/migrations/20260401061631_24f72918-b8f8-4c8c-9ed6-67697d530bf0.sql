
-- =============================================
-- LOOKBOOK: Tag portfolio items to rental items
-- =============================================
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS linked_rental_ids uuid[] DEFAULT '{}';
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS lookbook_description text;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS is_lookbook boolean DEFAULT false;

-- =============================================
-- SMART BUNDLES: Pre-packaged product bundles
-- =============================================
CREATE TABLE public.product_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  trigger_service_type text DEFAULT 'venue',
  trigger_categories text[] DEFAULT '{}',
  bundle_items jsonb NOT NULL DEFAULT '[]',
  discount_percent numeric DEFAULT 0,
  total_price numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active bundles" ON public.product_bundles
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage bundles" ON public.product_bundles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- INSTANT 24-HOUR VENUE HOLD (₹2000)
-- =============================================
CREATE TABLE public.venue_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL,
  user_id uuid NOT NULL,
  hold_date date NOT NULL,
  slot text DEFAULT 'full_day',
  amount_paid numeric NOT NULL DEFAULT 2000,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(venue_id, hold_date, slot)
);

ALTER TABLE public.venue_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create venue holds" ON public.venue_holds
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own holds" ON public.venue_holds
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all holds" ON public.venue_holds
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- EVENT FOLDERS (Workspace)
-- =============================================
CREATE TABLE public.event_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  title text NOT NULL,
  event_date date,
  venue_order_id uuid,
  status text DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own folders" ON public.event_folders
  FOR SELECT TO authenticated USING (client_id = auth.uid());

CREATE POLICY "Clients can create own folders" ON public.event_folders
  FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own folders" ON public.event_folders
  FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can manage all folders" ON public.event_folders
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Event folder members (vendors attached to the event)
CREATE TABLE public.event_folder_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.event_folders(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL,
  order_id uuid,
  role text DEFAULT 'vendor',
  service_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_folder_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own folder members" ON public.event_folder_members
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.event_folders f WHERE f.id = folder_id AND f.client_id = auth.uid())
  );

CREATE POLICY "Clients can manage own folder members" ON public.event_folder_members
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.event_folders f WHERE f.id = folder_id AND f.client_id = auth.uid())
  );

CREATE POLICY "Vendors can view folders they belong to" ON public.event_folder_members
  FOR SELECT TO authenticated USING (vendor_id = auth.uid());

CREATE POLICY "Admins can manage all folder members" ON public.event_folder_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Event timeline / run-of-show
CREATE TABLE public.event_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.event_folders(id) ON DELETE CASCADE,
  time text NOT NULL,
  title text NOT NULL,
  description text,
  assigned_vendor_id uuid,
  reminder_sent boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage own timeline" ON public.event_timeline
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.event_folders f WHERE f.id = folder_id AND f.client_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.event_folders f WHERE f.id = folder_id AND f.client_id = auth.uid())
  );

CREATE POLICY "Vendors can view assigned timeline items" ON public.event_timeline
  FOR SELECT TO authenticated USING (assigned_vendor_id = auth.uid());

CREATE POLICY "Admins can manage all timelines" ON public.event_timeline
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- B2B CROSS-HIRE NETWORK
-- =============================================
CREATE TABLE public.b2b_hire_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requesting_vendor_id uuid NOT NULL,
  item_name text NOT NULL,
  quantity_needed integer NOT NULL DEFAULT 1,
  needed_date date NOT NULL,
  needed_till_date date,
  budget_per_unit numeric,
  status text DEFAULT 'open',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_hire_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can create b2b requests" ON public.b2b_hire_requests
  FOR INSERT TO authenticated WITH CHECK (requesting_vendor_id = auth.uid() AND public.has_role(auth.uid(), 'vendor'));

CREATE POLICY "Vendors can view all open b2b requests" ON public.b2b_hire_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'vendor'));

CREATE POLICY "Vendors can update own b2b requests" ON public.b2b_hire_requests
  FOR UPDATE TO authenticated USING (requesting_vendor_id = auth.uid()) WITH CHECK (requesting_vendor_id = auth.uid());

CREATE POLICY "Admins can manage b2b requests" ON public.b2b_hire_requests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- B2B responses/offers
CREATE TABLE public.b2b_hire_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.b2b_hire_requests(id) ON DELETE CASCADE,
  offering_vendor_id uuid NOT NULL,
  price_per_unit numeric NOT NULL,
  quantity_available integer NOT NULL DEFAULT 1,
  status text DEFAULT 'offered',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_hire_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can create b2b offers" ON public.b2b_hire_offers
  FOR INSERT TO authenticated WITH CHECK (offering_vendor_id = auth.uid() AND public.has_role(auth.uid(), 'vendor'));

CREATE POLICY "Vendors can view relevant offers" ON public.b2b_hire_offers
  FOR SELECT TO authenticated USING (
    offering_vendor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.b2b_hire_requests r WHERE r.id = request_id AND r.requesting_vendor_id = auth.uid())
  );

CREATE POLICY "Admins can manage b2b offers" ON public.b2b_hire_offers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- LABOR & SHIFT TRACKER
-- =============================================
CREATE TABLE public.labor_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  worker_name text NOT NULL,
  worker_phone text,
  shift_date date NOT NULL,
  hours_worked numeric DEFAULT 8,
  daily_rate numeric NOT NULL DEFAULT 600,
  total_pay numeric GENERATED ALWAYS AS (hours_worked * (daily_rate / 8)) STORED,
  order_id uuid,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.labor_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage own shifts" ON public.labor_shifts
  FOR ALL TO authenticated USING (vendor_id = auth.uid()) WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Admins can manage all shifts" ON public.labor_shifts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
