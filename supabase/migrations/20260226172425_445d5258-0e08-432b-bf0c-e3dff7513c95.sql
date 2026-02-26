
-- Allow public inserts into rental_orders from the inquiry form
CREATE POLICY "Public can create rental orders from forms"
ON public.rental_orders
FOR INSERT
WITH CHECK (true);
