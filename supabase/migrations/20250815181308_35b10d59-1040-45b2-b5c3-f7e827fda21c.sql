-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update admin policies to check for admin role
DROP POLICY "Admin full access hero_banners" ON public.hero_banners;
DROP POLICY "Admin full access services" ON public.services;
DROP POLICY "Admin full access rentals" ON public.rentals;
DROP POLICY "Admin full access trusted_clients" ON public.trusted_clients;
DROP POLICY "Admin full access news_achievements" ON public.news_achievements;
DROP POLICY "Admin full access events" ON public.events;
DROP POLICY "Admin full access portfolio" ON public.portfolio;
DROP POLICY "Admin full access awards" ON public.awards;
DROP POLICY "Admin full access about_content" ON public.about_content;
DROP POLICY "Admin full access form_submissions" ON public.form_submissions;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new admin policies using the function
CREATE POLICY "Admin full access hero_banners" ON public.hero_banners
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access services" ON public.services
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access rentals" ON public.rentals
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access trusted_clients" ON public.trusted_clients
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access news_achievements" ON public.news_achievements
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access events" ON public.events
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access portfolio" ON public.portfolio
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access awards" ON public.awards
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin full access about_content" ON public.about_content
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin read form_submissions" ON public.form_submissions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin update form_submissions" ON public.form_submissions
  FOR UPDATE USING (public.is_admin());

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();