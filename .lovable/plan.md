

## Instant Booking Engine — Markup Pricing, Logistics Calculator & 48-Hour Buffer

### Overview

Transform the current "enquiry-based" checkout into an **Instant Book** flow with:
1. **Vendor base price → platform retail price** (30% markup, never showing base price to clients)
2. **Dynamic manpower fee** calculated from item weight/volume at checkout
3. **Dynamic transport fee** calculated from vendor warehouse PIN → client delivery PIN
4. **48-hour booking buffer** — events < 48 hours away fall back to "Request for Quote"
5. **Vendor payout summary** on order confirmation notifications

---

### Phase 1: Database Schema Changes

**Migration — Add columns to `vendor_inventory`:**
- `vendor_base_price numeric` — the vendor's actual cost per unit (hidden from clients)
- `labor_weight integer default 1` — volume/weight units per item (1 chair = 1, 1 truss = 20)

The existing `price_value` column becomes the **retail price** (auto-calculated or manually set by admin). For vendor items, the platform applies markup.

**Migration — Add columns to `profiles` (vendor warehouse):**
- `warehouse_pincode text` — vendor's warehouse/godown PIN code (already has `godown_address` but no dedicated pincode)

**Migration — Add transport tiers config table:**
```sql
CREATE TABLE transport_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_km integer NOT NULL DEFAULT 0,
  max_km integer,
  base_fee numeric NOT NULL,
  per_km_fee numeric DEFAULT 0,
  vehicle_type text DEFAULT 'Tata Ace',
  created_at timestamptz DEFAULT now()
);
-- Seed default tiers
INSERT INTO transport_tiers (min_km, max_km, base_fee, per_km_fee, vehicle_type) VALUES
  (0, 5, 800, 0, 'Tata Ace'),
  (5, 15, 1500, 0, 'Tata Ace'),
  (15, NULL, 1500, 50, 'Tata Ace');
```

**Migration — Add logistics config table:**
```sql
CREATE TABLE logistics_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  markup_percent numeric NOT NULL DEFAULT 30,
  labor_units_per_loader integer NOT NULL DEFAULT 100,
  loader_daily_rate numeric NOT NULL DEFAULT 600,
  min_booking_hours integer NOT NULL DEFAULT 48,
  updated_at timestamptz DEFAULT now()
);
INSERT INTO logistics_config DEFAULT VALUES;
```

RLS: Admin-only write, public read for both new tables.

---

### Phase 2: Pricing Utility — `src/utils/pricingUtils.ts`

Add functions:
- `applyMarkup(vendorBasePrice, markupPercent)` → retail price
- `calculateManpowerFee(items[], laborUnitsPerLoader, loaderRate)` → sum labor_weight × quantity across items, divide by threshold, multiply by rate
- `calculateTransportFee(distanceKm, tiers[])` → match tier, return fee

---

### Phase 3: Vendor Form Changes — `InventoryManager.tsx`

**Add to the form:**
- `vendor_base_price` field (labeled "Your Base Price per unit") — required for rentals
- `labor_weight` field (labeled "Volume Units" with helper: "1 chair = 1, 1 sofa = 10, 1 truss = 20") — default 1
- Auto-display "Client will see: ₹X" calculated from base price × 1.3

**On save:** Store `vendor_base_price` and `labor_weight`. Calculate `price_value = vendor_base_price * markup` and store it so the ecommerce page shows the retail price directly.

---

### Phase 4: Vendor Profile — Warehouse PIN

**`VendorProfileSettings.tsx`**: Add a "Warehouse / Godown PIN Code" field that saves to `profiles.warehouse_pincode`.

---

### Phase 5: Cart Checkout Redesign — `Cart.tsx`

Replace "Proceed to Enquiry" with smart logic:

```text
IF all items have price_value (instant-bookable):
  IF event date >= now + 48 hours:
    → Show "Instant Book" flow with:
      1. Item subtotal (markup-inclusive prices × quantities)
      2. Manpower fee (auto-calculated from labor_weight totals)
      3. Transport fee (calculated from vendor PIN → client PIN distance)
      4. Grand total
      5. "Confirm & Pay Advance" button
  ELSE:
    → Show "Request Quote" fallback (current enquiry flow)
ELSE (some items need quotes):
  → Show current enquiry flow
```

**Transport calculation**: Use a new edge function `calculate-transport` that:
1. Takes vendor warehouse pincode + client delivery pincode
2. Uses OpenStreetMap Nominatim (free) to geocode both PINs
3. Calculates straight-line distance × 1.4 (road factor)
4. Matches against `transport_tiers` table
5. Returns fee

**Manpower calculation**: Pure frontend — sum `(labor_weight × quantity)` for all cart items, divide by `labor_units_per_loader`, ceil, multiply by `loader_daily_rate`.

---

### Phase 6: Hooks

**`src/hooks/useLogisticsConfig.ts`** — fetches `logistics_config` (single row) + `transport_tiers`

**`src/hooks/useTransportFee.ts`** — calls the `calculate-transport` edge function with vendor + client pincodes

---

### Phase 7: Edge Function — `calculate-transport`

```
POST /calculate-transport
Body: { vendor_pincode, client_pincode }
Response: { distance_km, fee, vehicle_type }
```
- Geocode via Nominatim API (free, no key needed)
- Haversine distance × 1.4 road factor
- Match tier from `transport_tiers` table
- Return fee

---

### Phase 8: Order Flow Changes

**On "Confirm & Pay":**
1. Create `reservation_hold` (existing 10-min hold system)
2. Create `rental_order` with new fields: `manpower_fee`, `transport_fee`, `platform_markup_amount`, `vendor_payout_amount`
3. Send vendor WhatsApp notification: "New order! You will receive ₹X COD" (their base + transport + labor)

**Migration — Add to `rental_orders`:**
- `manpower_fee numeric default 0`
- `transport_fee numeric default 0`  
- `platform_fee numeric default 0`
- `vendor_payout numeric default 0`

---

### Phase 9: Admin Config Panel

Add a simple "Logistics Settings" section in admin dashboard to edit:
- Markup percentage
- Labor units per loader threshold
- Loader daily rate
- Minimum booking hours
- Transport tiers (CRUD)

---

### Data Flow Summary

```text
Vendor adds item:
  vendor_base_price = 10
  labor_weight = 1
  → price_value = 10 × 1.30 = 13 (stored, shown to client)

Client adds 250 chairs + enters delivery PIN:
  Item subtotal: 250 × 13 = 3,250
  Manpower: ceil(250 × 1 / 100) × 600 = 1,800
  Transport: PIN distance → tier match → 800
  Total: 5,850

Vendor receives:
  Base: 250 × 10 = 2,500
  + Transport: 800
  + Labor: 1,800
  = Vendor payout: 5,100
  Platform keeps: 750 (markup)
```

### Files Changed

| File | Change |
|---|---|
| **New migration** | Add `vendor_base_price`, `labor_weight` to `vendor_inventory`; `warehouse_pincode` to `profiles`; `manpower_fee`, `transport_fee`, `platform_fee`, `vendor_payout` to `rental_orders`; create `transport_tiers` + `logistics_config` tables |
| `src/utils/pricingUtils.ts` | Add markup, manpower, transport calculation functions |
| `src/components/vendor/InventoryManager.tsx` | Add base price + labor weight fields; auto-calc retail price on save |
| `src/components/vendor/VendorProfileSettings.tsx` | Add warehouse pincode field |
| `src/pages/Cart.tsx` | Smart checkout: instant book vs enquiry; show manpower + transport line items; 48-hour buffer check |
| `src/hooks/useLogisticsConfig.ts` | New — fetch logistics config + transport tiers |
| `src/hooks/useTransportFee.ts` | New — call edge function for distance calc |
| `supabase/functions/calculate-transport/index.ts` | New — geocode PINs, calc distance, return transport fee |
| `src/hooks/useCart.ts` | Add `labor_weight` and `vendor_id` to CartItem interface |
| `src/components/admin/LogisticsConfigManager.tsx` | New — admin UI for markup %, loader rate, transport tiers |
| `src/pages/admin/AdminDashboard.tsx` | Add Logistics Config tab |

