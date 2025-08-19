-- Fix site_settings RLS policies to allow initial setup

-- First, let's check if we have any admin users and any site_settings
DO $$
DECLARE
    admin_count INTEGER;
    settings_count INTEGER;
BEGIN
    -- Count admin users
    SELECT COUNT(*) INTO admin_count FROM public.admin_users WHERE is_active = true;
    
    -- Count settings records
    SELECT COUNT(*) INTO settings_count FROM public.site_settings;
    
    -- If no admin users and no settings, we need to allow initial setup
    IF admin_count = 0 OR settings_count = 0 THEN
        -- Drop existing restrictive policies
        DROP POLICY IF EXISTS "Admin users can read site settings" ON public.site_settings;
        DROP POLICY IF EXISTS "Admin users can insert site settings" ON public.site_settings;
        DROP POLICY IF EXISTS "Admin users can update site settings" ON public.site_settings;
        DROP POLICY IF EXISTS "Admin users can delete site settings" ON public.site_settings;
        
        -- Create more permissive policies for initial setup
        CREATE POLICY "Allow reading site settings" ON public.site_settings
        FOR SELECT TO authenticated
        USING (true);
        
        CREATE POLICY "Allow initial site settings creation" ON public.site_settings
        FOR INSERT TO authenticated
        WITH CHECK (
            -- Allow insert if no settings exist OR user is admin
            NOT EXISTS (SELECT 1 FROM public.site_settings) OR 
            public.is_admin_secure()
        );
        
        CREATE POLICY "Admin users can update site settings" ON public.site_settings
        FOR UPDATE TO authenticated
        USING (public.is_admin_secure())
        WITH CHECK (public.is_admin_secure());
        
        CREATE POLICY "Admin users can delete site settings" ON public.site_settings
        FOR DELETE TO authenticated
        USING (public.is_admin_secure());
        
        -- Create an initial admin user if none exists
        IF admin_count = 0 THEN
            INSERT INTO public.admin_users (
                email, 
                full_name, 
                password_hash, 
                role, 
                is_active,
                password_changed_at
            ) VALUES (
                'admin@example.com',
                'System Administrator', 
                'temp_password_hash', -- This should be changed immediately
                'admin',
                true,
                now()
            );
            
            RAISE NOTICE 'Created initial admin user: admin@example.com (please change credentials)';
        END IF;
    END IF;
END $$;

-- Create a function to check if user is admin OR if this is initial setup
CREATE OR REPLACE FUNCTION public.is_admin_or_initial_setup()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Allow if user is admin OR if no settings exist yet (initial setup)
    RETURN public.is_admin_secure() OR NOT EXISTS (SELECT 1 FROM public.site_settings);
END;
$$;

-- Update the insert policy to use the new function
DROP POLICY IF EXISTS "Allow initial site settings creation" ON public.site_settings;
CREATE POLICY "Allow admin or initial site settings creation" ON public.site_settings
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_initial_setup());