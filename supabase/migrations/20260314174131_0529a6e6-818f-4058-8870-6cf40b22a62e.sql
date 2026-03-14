
-- Allow vendors/clients to view rental orders they placed (client_id = auth.uid())
-- This covers the case where a vendor places an order as a customer
CREATE POLICY "Users can view own placed rental orders"
  ON public.rental_orders FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Drop the duplicate/narrower policy if it exists
DROP POLICY IF EXISTS "Clients can view own rental orders" ON public.rental_orders;
