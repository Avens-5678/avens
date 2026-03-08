
CREATE OR REPLACE FUNCTION public.lookup_order_by_id(order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'type', 'rental',
    'id', ro.id,
    'title', ro.title,
    'status', ro.status,
    'created_at', ro.created_at,
    'event_date', ro.event_date,
    'location', ro.location,
    'client_name', ro.client_name,
    'details', ro.equipment_details,
    'vendor_quote_amount', ro.vendor_quote_amount
  ) INTO result
  FROM rental_orders ro
  WHERE ro.id = order_id;

  IF result IS NOT NULL THEN
    RETURN result;
  END IF;

  SELECT jsonb_build_object(
    'type', 'service',
    'id', so.id,
    'title', so.title,
    'status', so.status,
    'created_at', so.created_at,
    'event_date', so.event_date,
    'location', so.location,
    'client_name', so.client_name,
    'details', so.service_details,
    'vendor_quote_amount', null
  ) INTO result
  FROM service_orders so
  WHERE so.id = order_id;

  RETURN result;
END;
$$;
