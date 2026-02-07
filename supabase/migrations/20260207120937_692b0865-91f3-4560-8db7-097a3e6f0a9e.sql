-- =============================================
-- RBAC SYSTEM: Phase 1 Database Schema
-- =============================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'vendor');

-- 2. Create request status enum
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'cancelled');

-- 3. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create event_requests table
CREATE TABLE public.event_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_vendor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status request_status DEFAULT 'pending' NOT NULL,
  event_type text NOT NULL,
  event_date date,
  location text,
  budget text,
  guest_count integer,
  requirements text,
  admin_notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on event_requests
ALTER TABLE public.event_requests ENABLE ROW LEVEL SECURITY;

-- 5. Create vendor_inventory table
CREATE TABLE public.vendor_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  quantity integer DEFAULT 1 NOT NULL,
  price_per_day numeric(10,2),
  image_url text,
  is_available boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on vendor_inventory
ALTER TABLE public.vendor_inventory ENABLE ROW LEVEL SECURITY;

-- 6. Extend profiles table with contact fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS bio text;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- 7. has_role function - checks if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 8. get_user_role function - returns user's role for routing
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 9. is_admin function using new roles system
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- =============================================
-- RLS POLICIES: user_roles
-- =============================================

-- Users can view their own role
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES: event_requests
-- =============================================

-- Clients can view their own requests
CREATE POLICY "Clients can view own requests"
ON public.event_requests FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- Clients can insert their own requests
CREATE POLICY "Clients can insert own requests"
ON public.event_requests FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid());

-- Vendors can view assigned requests
CREATE POLICY "Vendors can view assigned requests"
ON public.event_requests FOR SELECT
TO authenticated
USING (assigned_vendor_id = auth.uid());

-- Vendors can update status of assigned requests
CREATE POLICY "Vendors can update assigned requests"
ON public.event_requests FOR UPDATE
TO authenticated
USING (assigned_vendor_id = auth.uid())
WITH CHECK (assigned_vendor_id = auth.uid());

-- Admins have full access to event_requests
CREATE POLICY "Admins can view all requests"
ON public.event_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert requests"
ON public.event_requests FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
ON public.event_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete requests"
ON public.event_requests FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES: vendor_inventory
-- =============================================

-- Public can view available inventory (marketplace)
CREATE POLICY "Public can view available inventory"
ON public.vendor_inventory FOR SELECT
USING (is_available = true);

-- Vendors can view all their own inventory
CREATE POLICY "Vendors can view own inventory"
ON public.vendor_inventory FOR SELECT
TO authenticated
USING (vendor_id = auth.uid());

-- Vendors can manage their own inventory
CREATE POLICY "Vendors can insert own inventory"
ON public.vendor_inventory FOR INSERT
TO authenticated
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update own inventory"
ON public.vendor_inventory FOR UPDATE
TO authenticated
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can delete own inventory"
ON public.vendor_inventory FOR DELETE
TO authenticated
USING (vendor_id = auth.uid());

-- Admins have full access to vendor_inventory
CREATE POLICY "Admins can view all inventory"
ON public.vendor_inventory FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert inventory"
ON public.vendor_inventory FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inventory"
ON public.vendor_inventory FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete inventory"
ON public.vendor_inventory FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- EXTEND PROFILES RLS FOR VENDOR VISIBILITY
-- =============================================

-- Clients can view assigned vendor's profile
CREATE POLICY "Clients can view assigned vendor profile"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.event_requests er
    WHERE er.client_id = auth.uid()
    AND er.assigned_vendor_id = profiles.user_id
  )
);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TIMESTAMP UPDATE TRIGGER
-- =============================================

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to event_requests
CREATE TRIGGER update_event_requests_updated_at
  BEFORE UPDATE ON public.event_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to vendor_inventory
CREATE TRIGGER update_vendor_inventory_updated_at
  BEFORE UPDATE ON public.vendor_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED ADMIN ROLE FOR EXISTING SUPER ADMIN
-- =============================================

-- Insert admin role for existing super admin (leads@avens.in)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'leads@avens.in'
ON CONFLICT (user_id, role) DO NOTHING;