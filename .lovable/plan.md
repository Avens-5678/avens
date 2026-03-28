

## Booking System with Search, Availability Check & Hold Logic

### What This Builds

A complete booking flow (like MMT/OYO/Agoda) for venues, rentals, and crew — with date-based search, real-time availability checking, a 10-minute hold/lock system, and automatic inventory blocking.

### Current State

- Product detail page has add-to-cart flow (quantity-based), no date selection or availability checking
- `vendor_availability` table exists with slot support (morning/evening/full_day) but is only used by vendors to manually block dates
- No hold/reservation system exists
- No date-based search on the ecommerce page

### Architecture

```text
┌─────────────────────────────────────────────────────┐
│  STEP 1: SEARCH (Ecommerce Page)                    │
│  User picks: Location + Check-in/Check-out dates     │
│  → Filter listings by availability + location        │
│  → Show "Available" / "Sold Out" badges              │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  STEP 2: PRODUCT DETAIL PAGE                         │
│  Show calendar with available dates (green/red)      │
│  User selects dates → real-time price calculation    │
│  → System checks vendor_availability for conflicts   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  STEP 3: BOOK NOW → CREATE HOLD                      │
│  Insert into reservation_holds table:                │
│    status = 'held', expires_at = now() + 10 min      │
│  Temporarily reduce available inventory              │
│  Show countdown timer to user                        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  STEP 4: CONFIRM / EXPIRE                            │
│  User submits details → status = 'confirmed'         │
│  → Trigger auto-blocks vendor_availability           │
│  OR timer expires → status = 'expired'               │
│  → Inventory reverts automatically                   │
└─────────────────────────────────────────────────────┘
```

### Database Changes

**New table: `reservation_holds`**
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `rental_id` | uuid | The listing being held |
| `variant_id` | uuid, nullable | If variant-specific |
| `user_id` | uuid, nullable | Authenticated user (null for guest) |
| `session_id` | text | For guest tracking |
| `check_in` | date | Start date |
| `check_out` | date | End date |
| `slot` | text | morning/evening/full_day |
| `quantity` | integer, default 1 | Units held |
| `status` | text | 'held', 'confirmed', 'expired', 'cancelled' |
| `expires_at` | timestamptz | now() + 10 minutes |
| `created_at` | timestamptz | |

RLS: Public can INSERT (to create holds). Users can SELECT/UPDATE own holds (by user_id or session_id). Admins full access.

**New DB function: `get_available_inventory()`**
- Takes `rental_id`, `check_in`, `check_out`, `slot`
- Returns available quantity = base `quantity` minus:
  - Active holds (status='held' AND expires_at > now())
  - Confirmed bookings in `vendor_availability`
- Used by both search filtering and product detail availability check

**New DB function: `cleanup_expired_holds()`**
- Sets status='expired' where expires_at < now() AND status='held'
- Called periodically via pg_cron or on each availability check

**Add columns to `rental_orders`:**
- `check_in` (date) — booking start
- `check_out` (date) — booking end
- `hold_id` (uuid, nullable) — link back to reservation_holds

### Frontend Changes

**1. Ecommerce Page — Date Search Bar**
- Add a search bar below `ServiceSelector` with: Location input + Date picker (check-in/check-out) + Search button
- When dates are set, filter product cards to show only items with available inventory for those dates
- Add "Available" / "Sold Out" / "Limited" badges on product cards based on `get_available_inventory()`

**2. Product Detail Page — Booking Flow**
- Replace simple quantity+add-to-cart with a booking widget:
  - Date picker for check-in / check-out
  - Slot selector (for venues: morning/evening/full day)
  - Real-time availability calendar (fetch `vendor_availability` + active holds)
  - Price calculation: (price × days × quantity)
  - "Book Now" button → creates hold → navigates to checkout/confirmation
- Show 10-minute countdown timer after hold is created
- If hold expires, show "Session expired, try again" message

**3. New Hook: `useReservationHold`**
- `createHold()` — inserts into `reservation_holds`, returns hold ID
- `confirmHold()` — updates status to 'confirmed', creates rental_order
- `cancelHold()` — updates status to 'cancelled'
- Polls hold status to detect expiry

**4. New Hook: `useAvailability(rentalId, checkIn, checkOut)`**
- Public query (no auth required) that calls `get_available_inventory()`
- Returns: available quantity, is_available boolean, held count

**5. Checkout/Confirmation Page Update**
- After hold → show booking summary with countdown
- Collect customer details (name, phone, email)
- On submit → confirm hold → create rental_order → auto-block vendor_availability via existing trigger

### Files Changed

| File | Change |
|---|---|
| Migration | New `reservation_holds` table, `get_available_inventory()` function, `cleanup_expired_holds()` function, add `check_in`/`check_out`/`hold_id` to `rental_orders` |
| `src/hooks/useReservationHold.ts` | New — hold creation, confirmation, cancellation, expiry polling |
| `src/hooks/useAvailability.ts` | New — real-time availability check for a listing + date range |
| `src/pages/Ecommerce.tsx` | Add date search bar, filter by availability, availability badges on cards |
| `src/pages/ProductDetail.tsx` | Replace cart flow with booking widget: date picker, slot selector, availability calendar, hold creation, countdown timer |
| `src/components/ecommerce/EnhancedProductCard.tsx` | Show Available/Sold Out badge when search dates are active |
| `src/components/ecommerce/BookingSearchBar.tsx` | New — location + date range search component |
| `src/components/ecommerce/BookingWidget.tsx` | New — date selection, slot picker, price calc, Book Now with hold |
| `src/components/ecommerce/AvailabilityCalendarPublic.tsx` | New — public-facing calendar showing available/blocked dates |

### Hold System Flow Detail

1. User clicks "Book Now" → `useReservationHold.createHold()` inserts row with 10-min expiry
2. `get_available_inventory()` always subtracts active holds from total — so other users see reduced stock immediately
3. Countdown timer shows on UI — if it hits 0, hold auto-expires (DB function marks it expired)
4. User fills details and confirms → hold status → 'confirmed' → rental_order created → existing `auto_block_on_order_confirmed` trigger blocks vendor calendar
5. If vendor declines → rental_order status changes → hold cancelled → inventory reverts (availability row removed)

