-- Add dynamic pricing and variant support to vendor_inventory
ALTER TABLE public.vendor_inventory ADD COLUMN price_value numeric NULL;
ALTER TABLE public.vendor_inventory ADD COLUMN pricing_unit text NULL DEFAULT 'Per Day';
ALTER TABLE public.vendor_inventory ADD COLUMN has_variants boolean NULL DEFAULT false;
ALTER TABLE public.vendor_inventory ADD COLUMN short_description text NULL;
ALTER TABLE public.vendor_inventory ADD COLUMN image_urls text[] NULL DEFAULT '{}'::text[];
ALTER TABLE public.vendor_inventory ADD COLUMN categories text[] NULL DEFAULT '{}'::text[];
ALTER TABLE public.vendor_inventory ADD COLUMN search_keywords text NULL;
ALTER TABLE public.vendor_inventory ADD COLUMN display_order integer NULL DEFAULT 0;

-- Create vendor inventory variants table
CREATE TABLE public.vendor_inventory_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id uuid NOT NULL REFERENCES public.vendor_inventory(id) ON DELETE CASCADE,
  attribute_type text NOT NULL DEFAULT 'Size',
  attribute_value text NOT NULL,
  price_value numeric NULL,
  pricing_unit text NULL DEFAULT 'Per Day',
  stock_quantity integer NULL DEFAULT 1,
  image_url text NULL,
  image_urls text[] NULL DEFAULT '{}'::text[],
  display_order integer NULL DEFAULT 0,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_inventory_variants ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their own variants (through inventory item ownership)
CREATE POLICY "Vendors can view own variants"
  ON public.vendor_inventory_variants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.vendor_inventory vi
    WHERE vi.id = vendor_inventory_variants.inventory_item_id
    AND vi.vendor_id = auth.uid()
  ));

CREATE POLICY "Vendors can insert own variants"
  ON public.vendor_inventory_variants FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.vendor_inventory vi
    WHERE vi.id = vendor_inventory_variants.inventory_item_id
    AND vi.vendor_id = auth.uid()
  ));

CREATE POLICY "Vendors can update own variants"
  ON public.vendor_inventory_variants FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.vendor_inventory vi
    WHERE vi.id = vendor_inventory_variants.inventory_item_id
    AND vi.vendor_id = auth.uid()
  ));

CREATE POLICY "Vendors can delete own variants"
  ON public.vendor_inventory_variants FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.vendor_inventory vi
    WHERE vi.id = vendor_inventory_variants.inventory_item_id
    AND vi.vendor_id = auth.uid()
  ));

-- Admins can manage all variants
CREATE POLICY "Admins can manage vendor variants"
  ON public.vendor_inventory_variants FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active variants
CREATE POLICY "Public can view active vendor variants"
  ON public.vendor_inventory_variants FOR SELECT
  USING (is_active = true);