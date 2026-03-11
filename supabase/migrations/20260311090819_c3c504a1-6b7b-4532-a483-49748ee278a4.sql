
-- Helper function to check if employee has permission for a category
CREATE OR REPLACE FUNCTION public.employee_has_permission(_user_id uuid, _category text, _type text DEFAULT 'view')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employee_permissions
    WHERE employee_id = _user_id
      AND permission_category = _category
      AND CASE WHEN _type = 'edit' THEN can_edit = true ELSE can_view = true END
  )
$$;

-- rental_orders: employees with operations view access
CREATE POLICY "Employees can view rental orders"
  ON public.rental_orders FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'view'));

CREATE POLICY "Employees can update rental orders"
  ON public.rental_orders FOR UPDATE
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'edit'))
  WITH CHECK (employee_has_permission(auth.uid(), 'operations', 'edit'));

-- service_orders: employees with operations view access
CREATE POLICY "Employees can view service orders"
  ON public.service_orders FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'view'));

CREATE POLICY "Employees can update service orders"
  ON public.service_orders FOR UPDATE
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'edit'))
  WITH CHECK (employee_has_permission(auth.uid(), 'operations', 'edit'));

-- vendor_inventory: employees with ecommerce view access
CREATE POLICY "Employees can view vendor inventory"
  ON public.vendor_inventory FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'ecommerce', 'view'));

CREATE POLICY "Employees can update vendor inventory"
  ON public.vendor_inventory FOR UPDATE
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'ecommerce', 'edit'))
  WITH CHECK (employee_has_permission(auth.uid(), 'ecommerce', 'edit'));

-- form_submissions: employees with content view access
CREATE POLICY "Employees can view form submissions"
  ON public.form_submissions FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'content', 'view'));

CREATE POLICY "Employees can update form submissions"
  ON public.form_submissions FOR UPDATE
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'content', 'edit'))
  WITH CHECK (employee_has_permission(auth.uid(), 'content', 'edit'));

-- quotes: employees with operations view access
CREATE POLICY "Employees can view quotes"
  ON public.quotes FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'view'));

CREATE POLICY "Employees can manage quotes"
  ON public.quotes FOR ALL
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'edit'))
  WITH CHECK (employee_has_permission(auth.uid(), 'operations', 'edit'));

-- quote_line_items: employees with operations view access
CREATE POLICY "Employees can view quote line items"
  ON public.quote_line_items FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'view'));

CREATE POLICY "Employees can manage quote line items"
  ON public.quote_line_items FOR ALL
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'edit'))
  WITH CHECK (employee_has_permission(auth.uid(), 'operations', 'edit'));

-- event_requests: employees with operations view access
CREATE POLICY "Employees can view event requests"
  ON public.event_requests FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'view'));

CREATE POLICY "Employees can update event requests"
  ON public.event_requests FOR UPDATE
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations', 'edit'))
  WITH CHECK (employee_has_permission(auth.uid(), 'operations', 'edit'));

-- vendor_inventory_variants: employees with ecommerce view access
CREATE POLICY "Employees can view vendor inventory variants"
  ON public.vendor_inventory_variants FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'ecommerce', 'view'));

-- vendor_availability: employees with ecommerce view access
CREATE POLICY "Employees can view vendor availability"
  ON public.vendor_availability FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'ecommerce', 'view'));

-- profiles: employees need to see profiles for vendor/client info
CREATE POLICY "Employees can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'employee'));
