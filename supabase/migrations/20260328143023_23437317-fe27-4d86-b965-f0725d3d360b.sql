
-- 1. Create reservation_holds table
CREATE TABLE public.reservation_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid NOT NULL,
  variant_id uuid,
  user_id uuid,
  session_id text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  slot text NOT NULL DEFAULT 'full_day',
  quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'held',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reservation_holds ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can insert holds
CREATE POLICY "Public can create holds" ON public.reservation_holds
  FOR INSERT TO public WITH CHECK (true);

-- RLS: users can view own holds by user_id or session_id
CREATE POLICY "Users can view own holds" ON public.reservation_holds
  FOR SELECT TO public
  USING (user_id = auth.uid() OR session_id = session_id);

-- RLS: users can update own holds
CREATE POLICY "Users can update own holds" ON public.reservation_holds
  FOR UPDATE TO public
  USING (user_id = auth.uid() OR session_id = session_id)
  WITH CHECK (user_id = auth.uid() OR session_id = session_id);

-- RLS: admins full access
CREATE POLICY "Admins full access holds" ON public.reservation_holds
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. Add columns to rental_orders
ALTER TABLE public.rental_orders
  ADD COLUMN IF NOT EXISTS check_in date,
  ADD COLUMN IF NOT EXISTS check_out date,
  ADD COLUMN IF NOT EXISTS hold_id uuid REFERENCES public.reservation_holds(id);

-- 3. Function to cleanup expired holds
CREATE OR REPLACE FUNCTION public.cleanup_expired_holds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.reservation_holds
  SET status = 'expired'
  WHERE status = 'held' AND expires_at < now();
END;
$$;

-- 4. Function to get available inventory for a rental on given dates
CREATE OR REPLACE FUNCTION public.get_available_inventory(
  p_rental_id uuid,
  p_check_in date,
  p_check_out date,
  p_slot text DEFAULT 'full_day'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_qty integer;
  held_qty integer;
  booked_qty integer;
  available integer;
BEGIN
  -- First cleanup expired holds
  PERFORM public.cleanup_expired_holds();

  -- Get base quantity from rentals
  SELECT COALESCE(quantity, 1) INTO base_qty
  FROM public.rentals WHERE id = p_rental_id;

  IF base_qty IS NULL THEN
    -- Try vendor_inventory
    SELECT COALESCE(quantity, 1) INTO base_qty
    FROM public.vendor_inventory WHERE id = p_rental_id;
  END IF;

  IF base_qty IS NULL THEN
    RETURN jsonb_build_object('available', 0, 'base', 0, 'held', 0, 'booked', 0);
  END IF;

  -- Count active holds overlapping the date range
  SELECT COALESCE(SUM(quantity), 0) INTO held_qty
  FROM public.reservation_holds
  WHERE rental_id = p_rental_id
    AND status = 'held'
    AND expires_at > now()
    AND check_in < p_check_out
    AND check_out > p_check_in
    AND slot = p_slot;

  -- Count confirmed bookings from vendor_availability
  SELECT COUNT(*) INTO booked_qty
  FROM public.vendor_availability
  WHERE inventory_item_id = p_rental_id
    AND is_booked = true
    AND date >= p_check_in
    AND date < p_check_out
    AND (slot = p_slot OR slot = 'full_day' OR p_slot = 'full_day');

  available := GREATEST(base_qty - held_qty - booked_qty, 0);

  RETURN jsonb_build_object(
    'available', available,
    'base', base_qty,
    'held', held_qty,
    'booked', booked_qty
  );
END;
$$;
