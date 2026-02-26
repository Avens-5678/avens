
-- Fix the security definer view issue by making it SECURITY INVOKER
ALTER VIEW public.admin_users_safe SET (security_invoker = on);
