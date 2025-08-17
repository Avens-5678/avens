-- Create default admin users if they don't exist
INSERT INTO public.admin_users (email, full_name, password_hash, role, is_active, created_at, updated_at, password_changed_at)
VALUES 
  ('admin@avensevents.com', 'Admin User', 'SecureAdmin2024!', 'admin', true, now(), now(), now()),
  ('manager@avensevents.com', 'Manager User', 'Manager2024!', 'manager', true, now(), now(), now())
ON CONFLICT (email) DO NOTHING;