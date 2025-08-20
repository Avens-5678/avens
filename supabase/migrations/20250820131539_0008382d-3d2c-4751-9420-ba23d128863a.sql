-- Add event_date column to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN event_date DATE;