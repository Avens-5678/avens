CREATE OR REPLACE FUNCTION public.check_email_type(check_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  user_id_found uuid;
  user_roles_list text[];
BEGIN
  -- Check if email is registered in auth.users
  SELECT id INTO user_id_found FROM auth.users WHERE email = check_email LIMIT 1;
  
  -- Get non-admin roles if user exists (do not expose admin status)
  IF user_id_found IS NOT NULL THEN
    SELECT array_agg(role::text) INTO user_roles_list 
    FROM user_roles 
    WHERE user_id = user_id_found AND role <> 'admin';
  END IF;
  
  result := jsonb_build_object(
    'exists', user_id_found IS NOT NULL,
    'roles', COALESCE(to_jsonb(user_roles_list), '[]'::jsonb)
  );
  
  RETURN result;
END;
$function$;