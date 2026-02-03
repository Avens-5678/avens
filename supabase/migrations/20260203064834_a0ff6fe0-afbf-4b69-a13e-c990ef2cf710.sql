-- =====================================================
-- SECURITY FIX: Secure form_submissions table
-- Remove public read/update/delete, keep insert for forms
-- =====================================================

-- Drop dangerous public policies
DROP POLICY IF EXISTS "public_can_select_form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "public_can_update_form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "public_can_delete_form_submissions" ON public.form_submissions;

-- Keep insert policy for legitimate form submissions (already exists)
-- Policy "public_can_insert_form_submissions" allows anonymous inserts

-- Add admin-only access for read/update/delete
CREATE POLICY "Admins can read form submissions" 
ON public.form_submissions FOR SELECT 
TO authenticated
USING (is_admin_secure());

CREATE POLICY "Admins can update form submissions" 
ON public.form_submissions FOR UPDATE 
TO authenticated
USING (is_admin_secure())
WITH CHECK (is_admin_secure());

CREATE POLICY "Admins can delete form submissions" 
ON public.form_submissions FOR DELETE 
TO authenticated
USING (is_admin_secure());

-- =====================================================
-- SECURITY FIX: Secure content tables
-- Allow public READ, restrict WRITE to admins only
-- =====================================================

-- about_content: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to about_content" ON public.about_content;
CREATE POLICY "Public can read about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Admins can modify about content" ON public.about_content FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update about content" ON public.about_content FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete about content" ON public.about_content FOR DELETE TO authenticated USING (is_admin_secure());

-- awards: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to awards" ON public.awards;
CREATE POLICY "Public can read awards" ON public.awards FOR SELECT USING (true);
CREATE POLICY "Admins can modify awards" ON public.awards FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update awards" ON public.awards FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete awards" ON public.awards FOR DELETE TO authenticated USING (is_admin_secure());

-- client_testimonials: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to client_testimonials" ON public.client_testimonials;
CREATE POLICY "Public can read testimonials" ON public.client_testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can modify testimonials" ON public.client_testimonials FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update testimonials" ON public.client_testimonials FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete testimonials" ON public.client_testimonials FOR DELETE TO authenticated USING (is_admin_secure());

-- events: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to events" ON public.events;
CREATE POLICY "Public can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can modify events" ON public.events FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated USING (is_admin_secure());

-- hero_banners: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to hero_banners" ON public.hero_banners;
CREATE POLICY "Public can read hero banners" ON public.hero_banners FOR SELECT USING (true);
CREATE POLICY "Admins can modify hero banners" ON public.hero_banners FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update hero banners" ON public.hero_banners FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete hero banners" ON public.hero_banners FOR DELETE TO authenticated USING (is_admin_secure());

-- news_achievements: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to news_achievements" ON public.news_achievements;
CREATE POLICY "Public can read news" ON public.news_achievements FOR SELECT USING (true);
CREATE POLICY "Admins can modify news" ON public.news_achievements FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update news" ON public.news_achievements FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete news" ON public.news_achievements FOR DELETE TO authenticated USING (is_admin_secure());

-- portfolio: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to portfolio" ON public.portfolio;
CREATE POLICY "Public can read portfolio" ON public.portfolio FOR SELECT USING (true);
CREATE POLICY "Admins can modify portfolio" ON public.portfolio FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update portfolio" ON public.portfolio FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete portfolio" ON public.portfolio FOR DELETE TO authenticated USING (is_admin_secure());

-- rentals: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to rentals" ON public.rentals;
CREATE POLICY "Public can read rentals" ON public.rentals FOR SELECT USING (true);
CREATE POLICY "Admins can modify rentals" ON public.rentals FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update rentals" ON public.rentals FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete rentals" ON public.rentals FOR DELETE TO authenticated USING (is_admin_secure());

-- services: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to services" ON public.services;
CREATE POLICY "Public can read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can modify services" ON public.services FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated USING (is_admin_secure());

-- site_settings: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to site_settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can modify site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete site settings" ON public.site_settings FOR DELETE TO authenticated USING (is_admin_secure());

-- team_members: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to team_members" ON public.team_members;
CREATE POLICY "Public can read team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can modify team members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update team members" ON public.team_members FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete team members" ON public.team_members FOR DELETE TO authenticated USING (is_admin_secure());

-- trusted_clients: Public read, admin write
DROP POLICY IF EXISTS "Allow all access to trusted_clients" ON public.trusted_clients;
CREATE POLICY "Public can read trusted clients" ON public.trusted_clients FOR SELECT USING (true);
CREATE POLICY "Admins can modify trusted clients" ON public.trusted_clients FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update trusted clients" ON public.trusted_clients FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete trusted clients" ON public.trusted_clients FOR DELETE TO authenticated USING (is_admin_secure());

-- faq: Already has proper policies, just need to secure write access
DROP POLICY IF EXISTS "Allow admin access to FAQ" ON public.faq;
CREATE POLICY "Admins can modify FAQ" ON public.faq FOR INSERT TO authenticated WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can update FAQ" ON public.faq FOR UPDATE TO authenticated USING (is_admin_secure()) WITH CHECK (is_admin_secure());
CREATE POLICY "Admins can delete FAQ" ON public.faq FOR DELETE TO authenticated USING (is_admin_secure());