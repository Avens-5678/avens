-- ============================================================
-- RLS POLICY FIXES
-- Addresses overly permissive anonymous INSERT policies and
-- missing client/vendor policies on core transactional tables.
-- ============================================================


-- ============================================================
-- TABLE: rental_orders
-- Problem: "Public can create rental orders from forms" uses
--   WITH CHECK (true), meaning ANY anonymous user can insert
--   an order with any status, including 'confirmed'. This also
--   triggers the auto_block_on_order_confirmed trigger.
-- Fix: Replace with authenticated-client-only INSERT that
--   enforces client_id = auth.uid() and restricts allowed
--   statuses to 'new' (enquiry) or 'accepted' (Razorpay flow).
-- ============================================================

DROP POLICY IF EXISTS "Public can create rental orders from forms" ON public.rental_orders;

CREATE POLICY "Clients can create own rental orders"
  ON public.rental_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid()
    AND status IN ('new', 'accepted')
  );


-- ============================================================
-- TABLE: rental_reviews
-- Note: "Anyone can submit reviews" (WITH CHECK true) is kept
--   intentionally. The table has no user_id/reviewer_id FK column
--   to tie to auth.uid(). Risk is mitigated by is_approved
--   defaulting to false — anonymous submissions cannot go live
--   without admin approval.
-- No change applied.
-- ============================================================


-- ============================================================
-- TABLE: reservation_holds
-- Problem: "Public can create holds" uses WITH CHECK (true),
--   allowing anonymous users to hold inventory indefinitely,
--   which is a denial-of-service vector against venue bookings.
-- Fix: Require authentication and enforce user_id = auth.uid().
-- ============================================================

DROP POLICY IF EXISTS "Public can create holds" ON public.reservation_holds;

CREATE POLICY "Authenticated users can create own holds"
  ON public.reservation_holds FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );


-- ============================================================
-- TABLE: quotes
-- Note: No direct client SELECT policy added. The quotes table
--   uses client_email + acceptance_token (not a user_id FK) for
--   access control. Clients access their quotes exclusively via
--   SECURITY DEFINER RPCs that accept the token. No change applied.
-- ============================================================


-- ============================================================
-- TABLE: payment_milestones
-- Problem: Clients have no UPDATE policy. The verify-razorpay-
--   payment edge function uses service_role (bypasses RLS) to
--   mark milestones paid — that is correct and stays as-is.
--   However clients should be able to see the updated state.
--   The missing gap: vendors assigned to an order should be
--   able to view milestones for their orders (already exists
--   as SELECT). No further write access needed for clients or
--   vendors — all milestone writes go through edge functions.
-- No changes needed here — already correct after previous fix.
-- ============================================================


-- ============================================================
-- TABLE: b2b_hire_offers
-- Problem: Vendors can INSERT and SELECT their own offers but
--   cannot UPDATE (e.g., change price) or DELETE (withdraw) them.
-- Fix: Add UPDATE and DELETE for the offering vendor.
-- ============================================================

CREATE POLICY "Vendors can update own b2b offers"
  ON public.b2b_hire_offers FOR UPDATE
  TO authenticated
  USING (offering_vendor_id = auth.uid())
  WITH CHECK (offering_vendor_id = auth.uid());

CREATE POLICY "Vendors can delete own b2b offers"
  ON public.b2b_hire_offers FOR DELETE
  TO authenticated
  USING (offering_vendor_id = auth.uid());


-- ============================================================
-- TABLE: vendor_availability
-- Problem: Admins can SELECT and UPDATE availability but cannot
--   INSERT or DELETE rows. This blocks admin calendar management.
-- Fix: Add INSERT and DELETE for admins.
-- ============================================================

CREATE POLICY "Admins can insert vendor availability"
  ON public.vendor_availability FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete vendor availability"
  ON public.vendor_availability FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- ============================================================
-- TABLE: vehicle_tiers
-- Problem: Admin policy uses is_admin() (the less-secure
--   function) instead of is_admin_secure(). Minor but consistent
--   with the rest of the codebase which uses is_admin_secure().
-- Fix: Drop and recreate with is_admin_secure().
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage vehicle_tiers" ON public.vehicle_tiers;

CREATE POLICY "Admins can manage vehicle_tiers"
  ON public.vehicle_tiers FOR ALL
  TO authenticated
  USING (is_admin_secure())
  WITH CHECK (is_admin_secure());
