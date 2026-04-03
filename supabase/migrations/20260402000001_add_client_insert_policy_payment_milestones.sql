-- Clients can insert milestones for orders they own.
-- Required for the Razorpay checkout flow in Cart.tsx, which creates
-- milestone rows (all pending) before opening the payment popup.
-- The WITH CHECK mirrors the existing SELECT policy pattern.

CREATE POLICY "Clients can insert milestones for own orders"
  ON public.payment_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rental_orders ro
      WHERE ro.id = payment_milestones.order_id
      AND ro.client_id = auth.uid()
    )
  );
