
-- Drop the header-based policies (they won't work well with Supabase JS client)
DROP POLICY IF EXISTS "Public can view quote by token" ON public.quotes;
DROP POLICY IF EXISTS "Public can sign quote by token" ON public.quotes;
DROP POLICY IF EXISTS "Public can view quote line items by token" ON public.quote_line_items;

-- Create RPC functions for public quote access by token
CREATE OR REPLACE FUNCTION public.get_quote_by_token(_token text)
RETURNS SETOF quotes
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.quotes
  WHERE acceptance_token = _token
    AND acceptance_token IS NOT NULL
    AND acceptance_token <> ''
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_quote_line_items_by_token(_token text)
RETURNS SETOF quote_line_items
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT qli.* FROM public.quote_line_items qli
  INNER JOIN public.quotes q ON q.id = qli.quote_id
  WHERE q.acceptance_token = _token
    AND q.acceptance_token IS NOT NULL
    AND q.acceptance_token <> ''
  ORDER BY qli.display_order ASC;
$$;

CREATE OR REPLACE FUNCTION public.sign_quote_by_token(_token text, _signature_url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.quotes
  SET signature_url = _signature_url,
      signed_at = now(),
      status = 'accepted'
  WHERE acceptance_token = _token
    AND acceptance_token IS NOT NULL
    AND acceptance_token <> ''
    AND signed_at IS NULL;
  
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected > 0;
END;
$$;
