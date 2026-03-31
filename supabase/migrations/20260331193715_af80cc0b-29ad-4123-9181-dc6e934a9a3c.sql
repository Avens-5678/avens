
-- Add virtual_tour_url to vendor_inventory
ALTER TABLE public.vendor_inventory ADD COLUMN IF NOT EXISTS virtual_tour_url text;

-- Create seasonal_pricing table
CREATE TABLE public.seasonal_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id uuid NOT NULL REFERENCES public.vendor_inventory(id) ON DELETE CASCADE,
  season_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  price_multiplier numeric NOT NULL DEFAULT 1.0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.seasonal_pricing ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their own seasonal pricing
CREATE POLICY "Vendors can manage own seasonal pricing"
  ON public.seasonal_pricing
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vendor_inventory vi
      WHERE vi.id = seasonal_pricing.inventory_item_id
        AND vi.vendor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendor_inventory vi
      WHERE vi.id = seasonal_pricing.inventory_item_id
        AND vi.vendor_id = auth.uid()
    )
  );

-- Public can read active seasonal pricing
CREATE POLICY "Public can read active seasonal pricing"
  ON public.seasonal_pricing
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins full access
CREATE POLICY "Admins can manage seasonal pricing"
  ON public.seasonal_pricing
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
