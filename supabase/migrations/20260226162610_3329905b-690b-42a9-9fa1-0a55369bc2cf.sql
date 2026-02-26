
-- Create rental_orders table for the Search & Send Engine
CREATE TABLE public.rental_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  equipment_category text NOT NULL DEFAULT 'General',
  equipment_details text,
  location text,
  event_date date,
  budget text,
  client_name text,
  client_phone text,
  client_email text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'sent_to_vendors', 'quoted', 'accepted', 'confirmed', 'completed', 'cancelled')),
  assigned_vendor_id uuid,
  vendor_response text,
  vendor_quote_amount numeric,
  vendor_responded_at timestamp with time zone,
  whatsapp_sent_at timestamp with time zone,
  notes text,
  action_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rental_orders ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins can do everything with rental orders"
ON public.rental_orders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Vendors can view orders assigned to them
CREATE POLICY "Vendors can view assigned orders"
ON public.rental_orders FOR SELECT
USING (assigned_vendor_id = auth.uid());

-- Vendors can update assigned orders (for accept/quote)
CREATE POLICY "Vendors can update assigned orders"
ON public.rental_orders FOR UPDATE
USING (assigned_vendor_id = auth.uid())
WITH CHECK (assigned_vendor_id = auth.uid());

-- Public can view by action_token (for WhatsApp links - handled via edge function with service role)

-- Trigger for updated_at
CREATE TRIGGER update_rental_orders_updated_at
BEFORE UPDATE ON public.rental_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for common queries
CREATE INDEX idx_rental_orders_status ON public.rental_orders(status);
CREATE INDEX idx_rental_orders_category ON public.rental_orders(equipment_category);
CREATE INDEX idx_rental_orders_location ON public.rental_orders(location);
CREATE INDEX idx_rental_orders_action_token ON public.rental_orders(action_token);
