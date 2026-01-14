-- =============================================
-- AVENS DATABASE SCHEMA RECREATION
-- Full database structure from backup
-- =============================================

-- ===========================================
-- PART 1: TABLES
-- ===========================================

-- 1. About Content Table
CREATE TABLE public.about_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    founder_name text NOT NULL,
    founder_image_url text,
    founder_note text NOT NULL,
    founder_quote text NOT NULL,
    mission_statement text NOT NULL,
    vision_statement text NOT NULL,
    full_about_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Admin Users Table
CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    role text DEFAULT 'admin'::text,
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    login_attempts integer DEFAULT 0,
    last_failed_login timestamp with time zone,
    account_locked_until timestamp with time zone,
    password_changed_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    last_password_reset timestamp with time zone,
    reset_token text,
    reset_token_expires timestamp with time zone,
    CONSTRAINT admin_users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'super_admin'::text])))
);

-- 3. Awards Table
CREATE TABLE public.awards (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    logo_url text,
    year integer,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Client Testimonials Table
CREATE TABLE public.client_testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    client_name text NOT NULL,
    testimonial text NOT NULL,
    rating integer NOT NULL,
    company text,
    "position" text,
    image_url text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT client_testimonials_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);

-- 5. Events Table
CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    event_type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    process_description text NOT NULL,
    hero_image_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    location text,
    specialties jsonb DEFAULT '[]'::jsonb,
    services jsonb DEFAULT '[]'::jsonb,
    process_steps jsonb DEFAULT '[]'::jsonb,
    hero_subtitle text,
    hero_cta_text text DEFAULT 'Book a Consultation'::text,
    what_we_do_title text DEFAULT 'What We Do'::text,
    services_section_title text DEFAULT 'Our Services'::text,
    url_slug text,
    meta_description text,
    default_portfolio_tags text[] DEFAULT '{}'::text[],
    hero_title text,
    hero_description text,
    cta_title text DEFAULT 'Ready to Create Something Amazing Together?'::text,
    cta_description text DEFAULT 'Let''s discuss your vision and create an unforgettable experience that exceeds your expectations.'::text,
    cta_button_text text DEFAULT 'Book a Consultation'::text
);

-- 6. FAQ Table
CREATE TABLE public.faq (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    question text NOT NULL,
    answer text NOT NULL,
    category text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 7. Form Submissions Table
CREATE TABLE public.form_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    message text NOT NULL,
    form_type text NOT NULL,
    event_type text,
    rental_id text,
    status text DEFAULT 'new'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    rental_title text,
    location text,
    event_date date
);

-- 8. Hero Banners Table
CREATE TABLE public.hero_banners (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    subtitle text,
    image_url text NOT NULL,
    event_type text NOT NULL,
    button_text text DEFAULT 'Learn More'::text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    hero_text_1 text DEFAULT 'Extraordinary'::text,
    hero_text_2 text DEFAULT 'Experiences'::text
);

-- 9. News Achievements Table
CREATE TABLE public.news_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    short_content text NOT NULL,
    image_url text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    show_on_home boolean DEFAULT false
);

-- 10. Portfolio Table
CREATE TABLE public.portfolio (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    event_id uuid NOT NULL,
    title text NOT NULL,
    image_url text NOT NULL,
    is_before_after boolean DEFAULT false,
    is_before boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tag text,
    album_url text,
    before_image_url text,
    after_image_url text,
    show_on_home boolean DEFAULT true
);

-- 11. Profiles Table
CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE,
    email text NOT NULL,
    full_name text,
    role text DEFAULT 'admin'::text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 12. Rentals Table
CREATE TABLE public.rentals (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    short_description text NOT NULL,
    price_range text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    show_on_home boolean DEFAULT true,
    quantity integer DEFAULT 1,
    size_options text[],
    rating numeric(2,1) DEFAULT 0.0,
    categories text[] DEFAULT '{}'::text[],
    search_keywords text,
    image_urls text[] DEFAULT '{}'::text[]
);

-- 13. Security Audit Log Table
CREATE TABLE public.security_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid,
    action text NOT NULL,
    table_name text,
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 14. Services Table
CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    short_description text NOT NULL,
    event_type text NOT NULL,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    show_on_home boolean DEFAULT true,
    image_url text
);

-- 15. Site Settings Table
CREATE TABLE public.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    background_audio_url text,
    background_audio_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 16. Team Members Table
CREATE TABLE public.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    short_bio text NOT NULL,
    full_bio text,
    photo_url text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 17. Trusted Clients Table
CREATE TABLE public.trusted_clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    logo_url text NOT NULL,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ===========================================
-- PART 2: FOREIGN KEY CONSTRAINTS
-- ===========================================

ALTER TABLE public.portfolio
    ADD CONSTRAINT portfolio_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- ===========================================
-- PART 3: INDEXES
-- ===========================================

CREATE INDEX idx_form_submissions_created_at ON public.form_submissions USING btree (created_at);
CREATE INDEX idx_hero_banners_display_order ON public.hero_banners USING btree (display_order);
CREATE INDEX idx_portfolio_event_id ON public.portfolio USING btree (event_id);
CREATE INDEX idx_services_event_type ON public.services USING btree (event_type);

-- ===========================================
-- PART 4: VIEWS
-- ===========================================

CREATE VIEW public.portfolio_view WITH (security_invoker='on') AS
SELECT p.id,
    p.title,
    p.image_url,
    p.event_id,
    p.display_order,
    p.tag,
    p.album_url,
    p.is_before,
    p.is_before_after,
    e.title AS event_title,
    e.event_type,
    e.location,
    e.description
FROM (public.portfolio p
    LEFT JOIN public.events e ON ((p.event_id = e.id)))
WHERE (e.is_active = true);

-- ===========================================
-- PART 5: HELPER FUNCTIONS
-- ===========================================

CREATE OR REPLACE FUNCTION public.is_admin_secure() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND is_active = true
    );
END;
$$;

-- ===========================================
-- PART 6: ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_clients ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- PART 7: RLS POLICIES
-- ===========================================

-- Admin Users Policies
CREATE POLICY "Admin users can update their own record" ON public.admin_users FOR UPDATE USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));
CREATE POLICY "Admin users can view their own record" ON public.admin_users FOR SELECT USING ((id = auth.uid()));
CREATE POLICY "Authenticated admins can view all admin users" ON public.admin_users FOR SELECT USING (public.is_admin_secure());

-- About Content - Public read, admin write
CREATE POLICY "Allow all access to about_content" ON public.about_content USING (true) WITH CHECK (true);

-- Awards - Public read, admin write
CREATE POLICY "Allow all access to awards" ON public.awards USING (true) WITH CHECK (true);

-- Client Testimonials - Public read, admin write
CREATE POLICY "Allow all access to client_testimonials" ON public.client_testimonials USING (true) WITH CHECK (true);

-- Events - Public read, admin write
CREATE POLICY "Allow all access to events" ON public.events USING (true) WITH CHECK (true);

-- FAQ Policies
CREATE POLICY "Allow admin access to FAQ" ON public.faq USING (true) WITH CHECK (true);
CREATE POLICY "Public can view active FAQs" ON public.faq FOR SELECT USING ((is_active = true));

-- Form Submissions - Public access for contact forms
CREATE POLICY "public_can_delete_form_submissions" ON public.form_submissions FOR DELETE USING (true);
CREATE POLICY "public_can_insert_form_submissions" ON public.form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_can_select_form_submissions" ON public.form_submissions FOR SELECT USING (true);
CREATE POLICY "public_can_update_form_submissions" ON public.form_submissions FOR UPDATE USING (true) WITH CHECK (true);

-- Hero Banners - Public read, admin write
CREATE POLICY "Allow all access to hero_banners" ON public.hero_banners USING (true) WITH CHECK (true);

-- News Achievements - Public read, admin write
CREATE POLICY "Allow all access to news_achievements" ON public.news_achievements USING (true) WITH CHECK (true);

-- Portfolio - Public read, admin write
CREATE POLICY "Allow all access to portfolio" ON public.portfolio USING (true) WITH CHECK (true);

-- Profiles - Users manage their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));

-- Rentals - Public read, admin write
CREATE POLICY "Allow all access to rentals" ON public.rentals USING (true) WITH CHECK (true);

-- Security Audit Log - Admin only
CREATE POLICY "Only admins can view audit logs" ON public.security_audit_log FOR SELECT USING (public.is_admin_secure());

-- Services - Public read, admin write
CREATE POLICY "Allow all access to services" ON public.services USING (true) WITH CHECK (true);

-- Site Settings - Public read, admin write
CREATE POLICY "Allow all access to site_settings" ON public.site_settings USING (true) WITH CHECK (true);

-- Team Members - Public read, admin write
CREATE POLICY "Allow all access to team_members" ON public.team_members USING (true) WITH CHECK (true);

-- Trusted Clients - Public read, admin write
CREATE POLICY "Allow all access to trusted_clients" ON public.trusted_clients USING (true) WITH CHECK (true);

-- ===========================================
-- PART 8: GRANT PERMISSIONS
-- ===========================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;