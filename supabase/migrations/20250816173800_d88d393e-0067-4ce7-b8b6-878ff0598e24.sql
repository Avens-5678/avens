-- Add show_on_home field to services table
ALTER TABLE public.services 
ADD COLUMN show_on_home boolean DEFAULT true;

-- Add show_on_home field to rentals table  
ALTER TABLE public.rentals 
ADD COLUMN show_on_home boolean DEFAULT true;