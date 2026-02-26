
-- Add new columns to vendor_inventory
ALTER TABLE public.vendor_inventory 
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS verified_by uuid;

-- Create vendor_availability table for calendar bookings
CREATE TABLE public.vendor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  inventory_item_id uuid REFERENCES public.vendor_inventory(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_booked boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, inventory_item_id, date)
);

-- Enable RLS
ALTER TABLE public.vendor_availability ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their own availability
CREATE POLICY "Vendors can view own availability"
  ON public.vendor_availability FOR SELECT
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert own availability"
  ON public.vendor_availability FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update own availability"
  ON public.vendor_availability FOR UPDATE
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can delete own availability"
  ON public.vendor_availability FOR DELETE
  USING (vendor_id = auth.uid());

-- Admins can view all availability
CREATE POLICY "Admins can view all availability"
  ON public.vendor_availability FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all availability"
  ON public.vendor_availability FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_vendor_availability_updated_at
  BEFORE UPDATE ON public.vendor_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
