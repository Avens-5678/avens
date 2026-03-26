
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}'::text[];
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS experience_level text DEFAULT NULL;
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS guest_capacity text DEFAULT NULL;
