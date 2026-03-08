
-- Add specifications JSONB column to rentals table
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '[]'::jsonb;

-- Create rental_reviews table
CREATE TABLE public.rental_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  reviewer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.rental_reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "Public can read approved reviews" ON public.rental_reviews
  FOR SELECT USING (is_approved = true);

-- Anyone can submit a review
CREATE POLICY "Anyone can submit reviews" ON public.rental_reviews
  FOR INSERT WITH CHECK (true);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON public.rental_reviews
  FOR ALL USING (is_admin_secure()) WITH CHECK (is_admin_secure());
