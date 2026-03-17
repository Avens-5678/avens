-- Add linked_rental_ids column to promo_banners for associating catalog items
ALTER TABLE public.promo_banners ADD COLUMN linked_rental_ids uuid[] DEFAULT '{}'::uuid[];