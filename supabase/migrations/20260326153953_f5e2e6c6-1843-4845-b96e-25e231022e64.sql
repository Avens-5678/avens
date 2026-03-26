
ALTER TABLE vendor_inventory
  ADD COLUMN IF NOT EXISTS service_type text NOT NULL DEFAULT 'rental',
  ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS guest_capacity text,
  ADD COLUMN IF NOT EXISTS experience_level text;
