

## Marketplace Redesign — Phased Implementation Plan

This is a large-scale architectural shift from an admin-centric model to a vendor-driven marketplace. It must be broken into phases to avoid breaking existing functionality.

---

### Phase 1: Enhanced Venue Form + Database Schema Expansion

**Database Migration — New columns on `vendor_inventory`:**
- `venue_type` (text) — banquet hall, lawn, rooftop, farmhouse, etc.
- `min_capacity` / `max_capacity` (integer)
- `num_halls` (integer)
- `seating_types` (text[]) — floating, theatre, cluster, classroom
- `pricing_packages` (jsonb) — `[{name: "Wedding", price: 50000, unit: "per event"}, ...]`
- `weekday_price` / `weekend_price` (numeric) — dynamic pricing
- `catering_type` (text) — in-house, external, both
- `parking_available` (boolean)
- `rooms_available` (integer)
- `av_equipment` (boolean)
- `cancellation_policy` (text)
- `advance_amount` (numeric)
- `refund_rules` (text)
- `video_url` (text) — walkthrough link
- `slot_types` (text[]) — morning, evening, full_day

**Same columns added to `rentals` table** so admin catalog mirrors vendor fields.

**UI: Redesign venue form in `InventoryManager.tsx`**
- When `service_type = 'venue'`, show a dedicated multi-step form inspired by Spalba/MakeMyTrip:
  - Step 1: Basic Info (name, location with address, venue type dropdown)
  - Step 2: Capacity & Spaces (min/max, halls, seating types checkboxes)
  - Step 3: Pricing (per day/event/plate, weekday vs weekend, packages builder)
  - Step 4: Media (cover + gallery uploads, video URL)
  - Step 5: Amenities (catering, parking, rooms, AV, decoration toggles)
  - Step 6: Policies (cancellation, advance, refund)
- Same form also surfaces in `RentalItemFormDialog.tsx` for admin

---

### Phase 2: Calendar Booking & Slot System

**Database Migration:**
- Expand `vendor_availability` table:
  - Add `slot` (text) — 'morning', 'evening', 'full_day'
  - Add `booking_order_id` (uuid, nullable) — link to the order that booked it
  - Add `is_auto_blocked` (boolean, default false)
  - Add unique constraint on `(inventory_item_id, date, slot)` to prevent double-booking

**UI: Enhanced `AvailabilityCalendar.tsx`**
- Show slot-level blocking (morning/evening/full-day) per date
- Color-coded: green = available, yellow = partially booked, red = fully booked
- Auto-block dates when an order is confirmed (via DB trigger)
- "Limited availability" badge on product cards when only 1 slot remains

**DB Trigger:** On `rental_orders.status` change to 'confirmed', auto-insert into `vendor_availability` with `is_auto_blocked = true`

---

### Phase 3: Direct Vendor Order Routing (Critical Architecture Change)

**Current flow:** Customer → Order → Admin → Manually assigns vendor
**New flow:** Customer → Order → Goes directly to the listing vendor

**Database Changes:**
- When a customer orders a `vendor_inventory` item, set `rental_orders.assigned_vendor_id = vendor_inventory.vendor_id` automatically
- Add `is_vendor_direct` (boolean) column to `rental_orders` — true for marketplace orders, false for admin-managed
- Add DB trigger: on `rental_orders` INSERT, if the ordered item is from `vendor_inventory`, auto-set `assigned_vendor_id`

**Vendor Dashboard updates:**
- `OrderTracker.tsx` — show rental_orders where `assigned_vendor_id = auth.uid()` (already partially works via RLS)
- Add accept/reject/quote flow directly in vendor order view
- Real-time notifications via Supabase subscription on new orders

**Admin role change:**
- Admin sees all orders but with a "Marketplace" badge for vendor-direct ones
- Admin can intervene/override but doesn't bottleneck the flow

---

### Phase 4: Vendor Ranking System

**Database Migration:**
- New table `vendor_metrics`:
  - `vendor_id` (uuid, unique)
  - `avg_rating` (numeric)
  - `total_reviews` (integer)
  - `avg_response_time_hours` (numeric)
  - `booking_success_rate` (numeric) — completed/total
  - `is_sponsored` (boolean, default false)
  - `rank_score` (numeric, computed)

**Ranking formula (DB function):**
```
rank_score = (avg_rating * 0.3) + (booking_success_rate * 0.25) + 
             (response_time_score * 0.2) + (price_score * 0.15) + 
             (sponsored_boost * 0.1)
```

**Frontend:**
- Sort vendor listings by `rank_score` descending
- Show "Top Rated" / "Fast Responder" badges on product cards
- Admin can toggle `is_sponsored` for revenue model

**DB Trigger:** Recalculate `vendor_metrics` on new review, order status change, or vendor response

---

### Phase 5: Offline Booking + Vendor Quotation Maker

**Database Changes:**
- Add `booking_source` column to `rental_orders` — 'online' or 'offline'
- Add `is_offline` (boolean, default false) to `rental_orders`

**Vendor Dashboard — New tabs:**
1. **"Create Offline Booking"** — simplified order form:
   - Select items from own inventory
   - Enter client name/phone
   - Set dates → auto-blocks calendar
   - Mark as "offline booking"
   - Auto-adjusts stock quantity

2. **"Quotation Maker"** — vendor version of admin QuoteMaker:
   - Pick items from own `vendor_inventory`
   - Add custom line items
   - Generate PDF quote
   - Send via WhatsApp/email
   - Track quote status

**Unified stock:** Both online and offline bookings deduct from the same `quantity` field, preventing mismatches.

---

### Phase 6: Enhanced Vendor Dashboard

**New sidebar structure for `VendorDashboard.tsx`:**

| Tab | Component | Status |
|---|---|---|
| AI Assistant | DashboardChatbot | Exists |
| My Orders | OrderTracker (enhanced) | Update |
| Add/Edit Listing | InventoryManager (enhanced) | Update |
| Calendar | AvailabilityCalendar (enhanced) | Update |
| Offline Booking | VendorOfflineBooking (new) | New |
| Quotation Maker | VendorQuoteMaker (new) | New |
| Earnings | VendorEarnings (new) | New |
| Profile | VendorProfileSettings | Exists |

**Earnings tab:** Simple analytics showing total orders, revenue, pending payments, monthly chart.

---

### Files Changed (All Phases)

| File | Change |
|---|---|
| Migration (Phase 1) | Add venue-specific columns to `vendor_inventory` and `rentals` |
| Migration (Phase 2) | Expand `vendor_availability` with slots, add double-booking constraint, auto-block trigger |
| Migration (Phase 3) | Add `is_vendor_direct` to `rental_orders`, auto-assign trigger |
| Migration (Phase 4) | New `vendor_metrics` table + rank calculation function |
| Migration (Phase 5) | Add `booking_source`/`is_offline` to `rental_orders` |
| `src/components/vendor/InventoryManager.tsx` | Multi-step venue form, enhanced UI |
| `src/components/admin/RentalItemFormDialog.tsx` | Mirror venue fields for admin |
| `src/components/vendor/AvailabilityCalendar.tsx` | Slot-based booking calendar |
| `src/components/vendor/OrderTracker.tsx` | Direct order management with accept/reject |
| `src/components/vendor/VendorOfflineBooking.tsx` | New — offline order creation |
| `src/components/vendor/VendorQuoteMaker.tsx` | New — vendor quotation tool |
| `src/components/vendor/VendorEarnings.tsx` | New — earnings analytics |
| `src/pages/vendor/VendorDashboard.tsx` | Restructured sidebar with new tabs |
| `src/hooks/useVendorInventory.ts` | Updated types for new fields |
| `src/hooks/useVendorAvailability.ts` | Slot-aware queries |
| `src/hooks/useRentalOrders.ts` | Auto-assign logic awareness |
| `src/pages/ProductDetail.tsx` | Show availability calendar, vendor badge, booking slots |

---

### Recommended Implementation Order

**Start with Phase 1 + 2** (venue form + calendar) — these are self-contained and immediately visible.
Then **Phase 3** (order routing) — the critical architecture shift.
Then **Phase 5** (offline bookings) — vendor operational need.
Then **Phase 4 + 6** (ranking + dashboard polish) — marketplace maturity features.

Each phase can be approved and built independently. Which phase should we start with?

