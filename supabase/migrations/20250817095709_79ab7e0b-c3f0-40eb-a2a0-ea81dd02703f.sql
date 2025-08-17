-- CRITICAL SECURITY FIX: Enable RLS on form_submissions table
-- This table contains sensitive customer data and must be protected

-- Enable Row Level Security on form_submissions table
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;