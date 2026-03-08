
-- Function to auto-sync event_requests to service_orders
CREATE OR REPLACE FUNCTION public.sync_event_request_to_service_orders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _client_name text;
  _client_phone text;
  _client_email text;
BEGIN
  -- Get client profile info
  SELECT full_name, phone, email
  INTO _client_name, _client_phone, _client_email
  FROM public.profiles
  WHERE user_id = NEW.client_id
  LIMIT 1;

  -- Insert into service_orders
  INSERT INTO public.service_orders (
    title,
    service_type,
    service_details,
    location,
    event_date,
    budget,
    guest_count,
    client_name,
    client_phone,
    client_email,
    notes
  ) VALUES (
    NEW.event_type || ' - Event Request',
    NEW.event_type,
    COALESCE(NEW.requirements, ''),
    COALESCE(NEW.location, ''),
    NEW.event_date,
    COALESCE(NEW.budget, ''),
    NEW.guest_count,
    COALESCE(_client_name, 'Customer'),
    COALESCE(_client_phone, ''),
    COALESCE(_client_email, ''),
    'Auto-synced from Event Request #' || substr(NEW.id::text, 1, 8)
  );

  RETURN NEW;
END;
$$;

-- Create trigger on event_requests
CREATE TRIGGER trg_sync_event_request_to_service_orders
  AFTER INSERT ON public.event_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_event_request_to_service_orders();

-- Backfill: insert any event_requests missing from service_orders
INSERT INTO public.service_orders (title, service_type, service_details, location, event_date, budget, guest_count, client_name, client_phone, client_email, notes)
SELECT
  er.event_type || ' - Event Request',
  er.event_type,
  COALESCE(er.requirements, ''),
  COALESCE(er.location, ''),
  er.event_date,
  COALESCE(er.budget, ''),
  er.guest_count,
  COALESCE(p.full_name, 'Customer'),
  COALESCE(p.phone, ''),
  COALESCE(p.email, ''),
  'Auto-synced from Event Request #' || substr(er.id::text, 1, 8)
FROM public.event_requests er
LEFT JOIN public.profiles p ON p.user_id = er.client_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_orders so
  WHERE so.notes LIKE '%' || substr(er.id::text, 1, 8) || '%'
);
