
-- Phase 1: Add new columns to vendor_inventory
ALTER TABLE public.vendor_inventory
  ADD COLUMN IF NOT EXISTS house_rules text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS amenities_matrix jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS crew_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS packages jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS portfolio_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS instagram_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS venue_pricing_model text DEFAULT 'dry_rental';

-- Phase 3: Create site_visit_requests table
CREATE TABLE public.site_visit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.vendor_inventory(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  preferred_date date NOT NULL,
  preferred_slot text DEFAULT 'morning',
  deposit_amount numeric DEFAULT 499,
  deposit_status text DEFAULT 'pending',
  visit_status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_visit_requests ENABLE ROW LEVEL SECURITY;

-- Clients can create site visit requests
CREATE POLICY "Clients can create site visits" ON public.site_visit_requests
  FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

-- Clients can view own site visits
CREATE POLICY "Clients can view own site visits" ON public.site_visit_requests
  FOR SELECT TO authenticated USING (client_id = auth.uid());

-- Vendors can view site visits for their venues
CREATE POLICY "Vendors can view venue site visits" ON public.site_visit_requests
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.vendor_inventory vi
      WHERE vi.id = site_visit_requests.venue_id AND vi.vendor_id = auth.uid()
    )
  );

-- Vendors can update site visits for their venues
CREATE POLICY "Vendors can update venue site visits" ON public.site_visit_requests
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.vendor_inventory vi
      WHERE vi.id = site_visit_requests.venue_id AND vi.vendor_id = auth.uid()
    )
  );

-- Admins can manage all site visits
CREATE POLICY "Admins can manage site visits" ON public.site_visit_requests
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_site_visit_requests_updated_at
  BEFORE UPDATE ON public.site_visit_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
