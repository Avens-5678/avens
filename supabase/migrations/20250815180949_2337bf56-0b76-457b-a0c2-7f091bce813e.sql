-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for admin users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin users
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Add trigger for updating timestamps
CREATE TRIGGER update_admin_users_updated_at 
BEFORE UPDATE ON public.admin_users 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (password: admin123 - should be changed in production)
INSERT INTO public.admin_users (email, password_hash, full_name, role) VALUES
('admin@avensevents.com', '$2b$10$rKvKh4b7Hd8W8y4ZrQfO1uLzY3mXYjBqNkOjKl5cQ2RvS7T9WxABC', 'Admin User', 'super_admin');

-- Update RLS policies to allow admin access to all tables
-- Form submissions admin access
CREATE POLICY "Admins can view all form submissions" 
ON public.form_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can update form submissions" 
ON public.form_submissions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Admin policies for content management
CREATE POLICY "Admins can manage hero banners" 
ON public.hero_banners 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage services" 
ON public.services 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage rentals" 
ON public.rentals 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage trusted clients" 
ON public.trusted_clients 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage news achievements" 
ON public.news_achievements 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage events" 
ON public.events 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage portfolio" 
ON public.portfolio 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage awards" 
ON public.awards 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage about content" 
ON public.about_content 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);