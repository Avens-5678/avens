
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS tax_type text DEFAULT 'gst',
  ADD COLUMN IF NOT EXISTS template text DEFAULT 'modern',
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_quote_id uuid REFERENCES public.quotes(id),
  ADD COLUMN IF NOT EXISTS acceptance_token text DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS signature_url text,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz;

-- Public can view quotes by acceptance token (for signature page)
CREATE POLICY "Public can view quote by token"
  ON public.quotes FOR SELECT
  TO anon, authenticated
  USING (acceptance_token IS NOT NULL AND acceptance_token != '');

-- Public can update signature fields by token
CREATE POLICY "Public can sign quote by token"
  ON public.quotes FOR UPDATE
  TO anon, authenticated
  USING (acceptance_token IS NOT NULL)
  WITH CHECK (acceptance_token IS NOT NULL);

-- Public can read line items for quotes they can see
CREATE POLICY "Public can view quote line items by quote access"
  ON public.quote_line_items FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_line_items.quote_id
    AND q.acceptance_token IS NOT NULL
    AND q.acceptance_token != ''
  ));
