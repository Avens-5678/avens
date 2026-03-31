

## Venue Enhancement — Virtual Tours, Compare, Seasonal Pricing, Verified Badge & Smart Recommendations

### Overview

Five professional features to elevate the venue marketplace to MMT/OYO level.

---

### 1. Virtual Tour Integration

**Database:** Add `virtual_tour_url` column to `vendor_inventory` (text, nullable). Already has `video_url` — this is separate for Matterport/360° embeds.

**Vendor Form (`VenueFormFields.tsx`):** Add "Virtual Tour URL" input field (accepts Matterport, YouTube 360, or any embed URL).

**Product Detail Page (`ProductDetail.tsx`):** Add a "Virtual Tour" tab in the existing Tabs component. If `virtual_tour_url` exists, render an iframe embed. If YouTube, convert to embed URL. If Matterport, embed directly. Show a "360° Tour Available" badge on the product card.

**Product Card (`EnhancedProductCard.tsx`):** Show a small "360° Tour" badge icon if the item has a `virtual_tour_url`.

---

### 2. Venue Comparison Feature

**New Component: `src/components/ecommerce/VenueCompare.tsx`**
- A comparison drawer/sheet that slides up from bottom
- State managed via React context or URL params
- Users click "Compare" checkbox on venue cards (max 3)
- Sticky bottom bar shows "Compare X venues" button when 2+ selected
- Clicking opens a side-by-side table: capacity, amenities (checkmarks), price, ratings, catering type, parking, AC, virtual tour availability

**Changes:**
- `EnhancedProductCard.tsx`: Add a "Compare" checkbox for venue items
- `Ecommerce.tsx`: Add comparison state, render `VenueCompare` sheet
- Comparison data pulled from already-loaded items (no extra queries)

---

### 3. Seasonal Pricing

**Database:** Create `seasonal_pricing` table:
- `id` (uuid, PK)
- `inventory_item_id` (uuid, references vendor_inventory)
- `season_name` (text — e.g., "Wedding Season", "Diwali")
- `start_date` (date)
- `end_date` (date)
- `price_multiplier` (numeric, default 1.0 — e.g., 1.25 for 25% markup)
- `is_active` (boolean, default true)
- RLS: vendors can manage own (via inventory_item_id join), public can read active

**Vendor Dashboard:** Add "Seasonal Pricing" section in venue form — vendor sets date ranges + multiplier (e.g., "Wedding Season: Nov 15 – Feb 28, +25%").

**Marketplace Logic:** When displaying venue price on PDP/cards, check if today (or selected booking dates) falls within any active seasonal pricing range. If yes, show original price struck through + seasonal price. Use a utility function `getSeasonalPrice(basePrice, itemId, checkIn)`.

---

### 4. Evnting Verified Badge

**Logic (no new table needed):** Compute badge eligibility client-side from existing data:
- Profile completeness: `company_name`, `phone`, `address`, `avatar_url` all filled → ✓
- Virtual tour: `virtual_tour_url` is set → ✓
- Reviews: 3+ approved reviews from `rental_reviews` → ✓
- All three conditions met = "Evnting Verified"

**New hook: `src/hooks/useVerifiedStatus.ts`**
- Takes `itemId` and `vendorId`
- Queries `profiles` (vendor profile fields), checks `virtual_tour_url` on item, counts `rental_reviews`
- Returns `{ isVerified, completionPercent, missingItems[] }`

**UI Changes:**
- `EnhancedProductCard.tsx`: Show gold "Evnting Verified ✓" badge if verified
- `ProductDetail.tsx`: Show verified badge near vendor name with tooltip showing what's verified
- `VendorProfileSettings.tsx`: Show verification progress bar — "Complete X more steps to get Evnting Verified"

---

### 5. Smart Recommendations

**New Component: `src/components/ecommerce/SmartRecommendations.tsx`**
- Appears on venue PDP below the booking widget
- Heading: "Based on your requirements, we also recommend"
- Algorithm: from the already-loaded venue items, filter by:
  - Same city/location (fuzzy match on `address`)
  - `min_capacity ≤ guest_count ≤ max_capacity` (if user entered guest count in booking widget)
  - Price within ±30% of current venue
  - Exclude current venue
  - Sort by rating descending, take top 3
- Renders as a horizontal scroll of `EnhancedProductCard` components

**Also show on Ecommerce page:** If user has applied guest count or budget filters, show a "Recommended for you" row at top using same algorithm.

---

### File Changes Summary

| # | File | Change |
|---|---|---|
| 1 | DB Migration | Add `virtual_tour_url` to `vendor_inventory`; create `seasonal_pricing` table with RLS |
| 2 | `VenueFormFields.tsx` | Add virtual tour URL input + seasonal pricing date range manager |
| 3 | `ProductDetail.tsx` | Add Virtual Tour tab, verified badge, smart recommendations section |
| 4 | `EnhancedProductCard.tsx` | Add 360° tour badge, compare checkbox, verified badge |
| 5 | New: `VenueCompare.tsx` | Side-by-side comparison sheet for up to 3 venues |
| 6 | `Ecommerce.tsx` | Add compare state/UI, recommended row |
| 7 | New: `SmartRecommendations.tsx` | Recommendation algorithm + horizontal scroller |
| 8 | New: `useVerifiedStatus.ts` | Hook to compute Evnting Verified eligibility |
| 9 | `VendorProfileSettings.tsx` | Show verification progress bar |
| 10 | `useVendorInventory.ts` | Add `virtual_tour_url` to interfaces |

