
-- ========================================
-- FIX 1: reservation_holds tautology policy
-- ========================================

-- Drop broken policies
DROP POLICY IF EXISTS "Users can view own holds" ON public.reservation_holds;
DROP POLICY IF EXISTS "Users can update own holds" ON public.reservation_holds;

-- Recreate with correct conditions (user_id match only, no tautology)
CREATE POLICY "Users can view own holds" ON public.reservation_holds
  FOR SELECT TO public
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own holds" ON public.reservation_holds
  FOR UPDATE TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ========================================
-- FIX 2: quotes publicly readable
-- ========================================

-- Drop the overly permissive public SELECT policies
DROP POLICY IF EXISTS "Public can view quote by token" ON public.quotes;
DROP POLICY IF EXISTS "Public can sign quote by token" ON public.quotes;
DROP POLICY IF EXISTS "Public can view quote line items by quote access" ON public.quote_line_items;

-- Quotes: require the caller to actually filter by the token value
-- This works because Supabase PostgREST passes the filter conditions,
-- and RLS checks row-by-row. The caller must supply ?acceptance_token=eq.<value>
-- to match any row, preventing enumeration.
CREATE POLICY "Public can view quote by token" ON public.quotes
  FOR SELECT TO anon, authenticated
  USING (
    acceptance_token IS NOT NULL
    AND acceptance_token <> ''
    AND acceptance_token = current_setting('request.headers', true)::json->>'x-quote-token'
  );

CREATE POLICY "Public can sign quote by token" ON public.quotes
  FOR UPDATE TO anon, authenticated
  USING (
    acceptance_token IS NOT NULL
    AND acceptance_token = current_setting('request.headers', true)::json->>'x-quote-token'
  )
  WITH CHECK (
    acceptance_token IS NOT NULL
    AND acceptance_token = current_setting('request.headers', true)::json->>'x-quote-token'
  );

CREATE POLICY "Public can view quote line items by token" ON public.quote_line_items
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes q
      WHERE q.id = quote_line_items.quote_id
        AND q.acceptance_token IS NOT NULL
        AND q.acceptance_token <> ''
        AND q.acceptance_token = current_setting('request.headers', true)::json->>'x-quote-token'
    )
  );

-- ========================================
-- FIX 3: user_roles self-escalation
-- ========================================

DROP POLICY IF EXISTS "Users can insert their own role during registration" ON public.user_roles;

CREATE POLICY "Users can insert their own role during registration" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role IN ('client'::app_role, 'vendor'::app_role)
  );

-- ========================================
-- FIX 4: Storage — remove overly permissive policies
-- ========================================

-- Remove all "Authenticated users can ..." policies on storage.objects
DROP POLICY IF EXISTS "Authenticated users can delete banner images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete client logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete general files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete specialty images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update client logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update general files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update specialty images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload client logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload general files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload specialty images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete audio" ON storage.objects;
