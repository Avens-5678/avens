
-- Create a security definer function for email role lookup (used by check-user-type edge function)
CREATE OR REPLACE FUNCTION public.check_email_type(check_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  is_admin_user boolean;
  user_id_found uuid;
  user_roles_list text[];
BEGIN
  -- Check if email is in admin_users
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE email = check_email AND is_active = true) INTO is_admin_user;
  
  -- Check if email is registered in auth.users
  SELECT id INTO user_id_found FROM auth.users WHERE email = check_email LIMIT 1;
  
  -- Get roles if user exists
  IF user_id_found IS NOT NULL THEN
    SELECT array_agg(role::text) INTO user_roles_list FROM user_roles WHERE user_id = user_id_found;
  END IF;
  
  result := jsonb_build_object(
    'is_admin', is_admin_user,
    'exists', user_id_found IS NOT NULL,
    'roles', COALESCE(to_jsonb(user_roles_list), '[]'::jsonb)
  );
  
  RETURN result;
END;
$$;
