
-- Update admin email in admin_users table
UPDATE public.admin_users SET email = 'admin@evnting.com' WHERE email = 'leads@avens.in';

-- Update is_super_admin function to use new email
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email 
    AND email = 'admin@evnting.com'
    AND is_active = true
  );
END;
$function$;
