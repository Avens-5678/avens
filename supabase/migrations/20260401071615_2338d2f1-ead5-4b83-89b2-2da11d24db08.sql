
-- Payment milestones table
CREATE TABLE public.payment_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.rental_orders(id) ON DELETE CASCADE,
  milestone_name text NOT NULL,
  amount_due numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamp with time zone,
  razorpay_link_id text,
  razorpay_payment_id text,
  payment_plan text NOT NULL DEFAULT 'advance',
  milestone_order integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add payment_plan column to rental_orders
ALTER TABLE public.rental_orders ADD COLUMN IF NOT EXISTS payment_plan text DEFAULT 'advance';

-- Enable RLS
ALTER TABLE public.payment_milestones ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage all milestones"
  ON public.payment_milestones FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Clients can view their own milestones
CREATE POLICY "Clients can view own milestones"
  ON public.payment_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_orders ro
      WHERE ro.id = payment_milestones.order_id
      AND ro.client_id = auth.uid()
    )
  );

-- Vendors can view milestones for their orders
CREATE POLICY "Vendors can view assigned milestones"
  ON public.payment_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_orders ro
      WHERE ro.id = payment_milestones.order_id
      AND ro.assigned_vendor_id = auth.uid()
    )
  );

-- Employees can view milestones
CREATE POLICY "Employees can view milestones"
  ON public.payment_milestones FOR SELECT
  TO authenticated
  USING (employee_has_permission(auth.uid(), 'operations'::text, 'view'::text));
