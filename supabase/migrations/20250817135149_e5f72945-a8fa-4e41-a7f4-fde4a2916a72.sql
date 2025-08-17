-- Add password reset fields to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS reset_token text,
ADD COLUMN IF NOT EXISTS reset_token_expires timestamp with time zone;