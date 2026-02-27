
-- Add price_value and pricing_unit columns to rentals table
ALTER TABLE public.rentals 
ADD COLUMN IF NOT EXISTS price_value numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pricing_unit text DEFAULT 'Per Day',
ADD COLUMN IF NOT EXISTS has_variants boolean DEFAULT false;

-- Create rental_variants table
CREATE TABLE public.rental_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id uuid NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  attribute_type text NOT NULL DEFAULT 'Size',
  attribute_value text NOT NULL,
  price_value numeric DEFAULT NULL,
  pricing_unit text DEFAULT 'Per Day',
  stock_quantity integer DEFAULT 1,
  image_url text DEFAULT NULL,
  image_urls text[] DEFAULT '{}'::text[],
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rental_variants
ALTER TABLE public.rental_variants ENABLE ROW LEVEL SECURITY;

-- Public can read active variants
CREATE POLICY "Public can read active variants"
ON public.rental_variants
FOR SELECT
USING (is_active = true);

-- Admins can manage variants
CREATE POLICY "Admins can insert variants"
ON public.rental_variants
FOR INSERT
WITH CHECK (is_admin_secure());

CREATE POLICY "Admins can update variants"
ON public.rental_variants
FOR UPDATE
USING (is_admin_secure())
WITH CHECK (is_admin_secure());

CREATE POLICY "Admins can delete variants"
ON public.rental_variants
FOR DELETE
USING (is_admin_secure());

-- Index for fast lookups
CREATE INDEX idx_rental_variants_rental_id ON public.rental_variants(rental_id);
