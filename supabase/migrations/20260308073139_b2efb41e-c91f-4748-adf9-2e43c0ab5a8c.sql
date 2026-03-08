-- Add admin role for new admin account
INSERT INTO public.user_roles (user_id, role)
VALUES ('e1c07522-b96e-4353-8751-109785b8b9e5', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove admin role from old account
DELETE FROM public.user_roles WHERE user_id = '2d0bf533-2bf0-4795-ac22-f42f9f162f56';

-- Delete old admin from admin_users table
DELETE FROM public.admin_users WHERE email = 'leads@avens.in';
