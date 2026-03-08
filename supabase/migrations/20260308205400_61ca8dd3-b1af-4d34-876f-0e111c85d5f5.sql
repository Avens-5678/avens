
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Evnting (Avens Events Pvt. Ltd.)',
  logo_url text,
  gst_number text DEFAULT '36AABCA1234B1Z5',
  pan_number text DEFAULT 'AABCA1234B',
  address text DEFAULT 'Plot No. 123, Jubilee Hills, Hyderabad, Telangana - 500033',
  phone text DEFAULT '+91 90000 00000',
  email text DEFAULT 'leads@avens.in',
  gst_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage company settings" ON public.company_settings
  FOR ALL TO authenticated
  USING (is_admin_secure())
  WITH CHECK (is_admin_secure());

CREATE POLICY "Public can read company settings" ON public.company_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Insert default row
INSERT INTO public.company_settings (company_name) VALUES ('Evnting (Avens Events Pvt. Ltd.)');
