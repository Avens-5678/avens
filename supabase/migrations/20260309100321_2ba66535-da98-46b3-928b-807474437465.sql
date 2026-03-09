
-- Add 'employee' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'employee';

-- Create employee_permissions table
CREATE TABLE public.employee_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_category text NOT NULL, -- 'ecommerce', 'content', 'operations'
  can_view boolean DEFAULT true,
  can_edit boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(employee_id, permission_category)
);

-- Enable RLS
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;

-- Admins can manage all employee permissions
CREATE POLICY "Admins can manage employee permissions"
ON public.employee_permissions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Employees can view their own permissions
CREATE POLICY "Employees can view own permissions"
ON public.employee_permissions
FOR SELECT
USING (employee_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_employee_permissions_updated_at
  BEFORE UPDATE ON public.employee_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
