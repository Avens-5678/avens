-- Add admin user for leads@avens.in
INSERT INTO public.admin_users (email, full_name, password_hash, role, is_active)
VALUES ('leads@avens.in', 'Avens Admin', 'otp_auth_only', 'admin', true)
ON CONFLICT (email) DO UPDATE SET is_active = true, updated_at = now();