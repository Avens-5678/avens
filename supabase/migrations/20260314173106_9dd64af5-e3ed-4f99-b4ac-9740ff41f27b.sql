
-- Add client_id column to rental_orders
ALTER TABLE public.rental_orders ADD COLUMN IF NOT EXISTS client_id uuid;

-- RLS: Clients can view their own rental orders
CREATE POLICY "Clients can view own rental orders"
  ON public.rental_orders FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());
