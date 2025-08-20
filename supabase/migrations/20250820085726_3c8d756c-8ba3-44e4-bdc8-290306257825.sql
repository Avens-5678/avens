-- Add show_on_home field to news_achievements table
ALTER TABLE public.news_achievements 
ADD COLUMN show_on_home boolean DEFAULT false;