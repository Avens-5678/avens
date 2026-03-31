

## Venue + Crew Hub — Full Architecture Plan

This is a massive multi-phase overhaul. Below is a prioritized, buildable plan broken into increments. Each phase builds on the previous one.

---

### Phase 1: Smart Search & Venue/Crew Discovery (Priority: HIGH)

**Goal:** Constraint-based search replacing the current generic filter sidebar for Venues and Crew Hub.

**Database Changes:**
- Add to `vendor_inventory`: `house_rules` (text[]), `amenities_matrix` (jsonb — structured key-value like `{valet_parking: true, bridal_rooms: 2, generator: true}`), `crew_type` (enum: `commodity` | `creative`), `packages` (jsonb — array of `{name, description, base_price, deliverables[]}`), `portfolio_urls` (text[]), `instagram_url` (text)
- Add to `vendor_availability`: no changes needed (already has `slot` column with morning/evening/full_day)

**Ecommerce.tsx — Venue Search Bar:**
- When `activeService === "venues"`, replace the sidebar filters with a prominent 3-field search bar: **Date + Session Slot** (Morning/Evening/Full Day), **Event Type** dropdown (Wedding, Haldi, Corporate, Birthday, etc.), **Guest Count** input
- Filter logic: query `vendor_availability` to exclude venues booked for the selected date+slot, filter by `min_capacity ≤ guest_count ≤ max_capacity`, filter by matching event types from categories

**Ecommerce.tsx — Crew Hub Split:**
- When `activeService === "crew-hub"`, show two sub-tabs: **"Quick Hire"** (commodity crew — flat cards, no profiles, add-to-cart style) and **"Creative Pros"** (portfolio-driven cards with gallery previews, ratings, Instagram links)
- Commodity crew cards: clean minimal UI showing "4 Waiters — ₹800/shift", quantity selector, add to cart
- Creative crew cards: rich visual cards with portfolio thumbnail grid, star rating, "View Portfolio" CTA

**Pricing Display:**
- Venue cards: show `₹X / Day` for dry rental, `₹X / Veg Plate` for per-plate (already have `venue_pricing_model` column)
- Per-plate venues: when guest count is entered in search bar, show calculated total on card: "~₹X for Y guests"

**Files:** `Ecommerce.tsx`, `EnhancedProductCard.tsx`, new `VenueSearchBar.tsx`, new `CrewSubTabs.tsx`, DB migration

---

### Phase 2: Venue Display Page Enhancement (Priority: HIGH)

**ProductDetail.tsx — Venue-specific sections:**
- **Amenities Matrix**: Structured icon grid from `amenities_matrix` jsonb — checkmark/cross for each amenity (Valet Parking, Bridal Rooms, Generator, Outside Catering, DJ Allowed, etc.)
- **House Rules**: Styled card listing restrictions from `house_rules[]` (e.g., "Music stops at 10 PM", "No cold pyros inside hall")
- **Virtual Tour**: Already implemented (iframe tab)
- **Capacity & Pricing Breakdown**: For per-plate venues, show Veg/Non-Veg plate prices with a guest count calculator

**Files:** `ProductDetail.tsx`, DB migration for `house_rules` and `amenities_matrix`

---

### Phase 3: Site Visit Booking Funnel (Priority: HIGH)

**Database:**
- Create `site_visit_requests` table: `id`, `venue_id`, `client_id`, `client_name`, `client_phone`, `client_email`, `preferred_date`, `preferred_slot`, `deposit_amount` (default 499), `deposit_status` (pending/paid/refunded/credited), `visit_status` (scheduled/completed/cancelled/no_show), `notes`, `created_at`, `updated_at`

**BookingWidget.tsx:**
- For venues: replace "Book Now" primary CTA with "Schedule Site Visit — ₹499 (Refundable)"
- Clicking opens a mini-form: preferred date, slot, name, phone (pre-filled from profile)
- Creates `site_visit_requests` record
- Show refund policy text: "100% credited toward booking advance, or refunded if you don't proceed"
- Secondary CTA: "Direct Booking" for returning clients who've already visited

**Vendor Dashboard — Site Visit Tab:**
- New `SiteVisitManager.tsx` component showing incoming visit requests
- Accept/Reschedule/Decline actions
- Accepted visits create a 24h soft-block on the calendar

**Files:** `BookingWidget.tsx`, new `SiteVisitManager.tsx`, `VendorDashboard.tsx`, DB migration

---

### Phase 4: Split Checkout & Payment Milestones (Priority: MEDIUM)

**Checkout Logic (BookingWidget + Cart):**
- After site visit completion, client can "Finalize Booking"
- Show split payment breakdown: "Platform Advance: ₹25,000 (covers confirmation)" + "Balance to Venue: ₹95,000 (pay in milestones)"
- Platform advance = markup amount + small venue lock-in deposit
- On advance payment confirmation → hard-block dates in `vendor_availability`

**Payment Milestones:**
- `payment_milestones` table already planned — create it: `id`, `order_id`, `vendor_id`, `milestone_name`, `amount`, `due_date`, `status` (pending/paid/overdue), `paid_at`, `payment_reference`
- DB trigger: auto-create 3 milestones on order confirmation (25% immediate, 50% 15 days before, 25% 3 days before)
- Vendor dashboard: `VenuePaymentTracker.tsx` — milestone cards with color-coded status, "Mark as Paid" action, WhatsApp reminder button

**Files:** `BookingWidget.tsx`, `Cart.tsx`, new `VenuePaymentTracker.tsx`, `VendorDashboard.tsx`, DB migration

---

### Phase 5: Event Folder System (Priority: MEDIUM)

**Database:**
- Create `event_folders` table: `id`, `client_id`, `event_name`, `event_date`, `venue_order_id`, `created_at`
- Create `event_folder_members` table: `id`, `folder_id`, `vendor_id`, `role` (venue_owner/photographer/decorator/etc), `order_id`, `added_at`

**Logic:**
- Auto-create an Event Folder when a venue booking is confirmed
- When client books crew/services for the same event date, prompt to add them to the existing folder
- Client Dashboard: "My Events" tab showing event folders with member cards

**Client Dashboard:**
- Event folder view with venue details card, list of attached crew/vendors
- Each member shows their role, booking status, and contact CTA

**Note:** In-app chat with regex filtering is a major feature requiring real-time infrastructure (Supabase Realtime channels). This will be planned as a separate phase.

**Files:** `ClientDashboard.tsx`, new `EventFolder.tsx`, new `EventFolderMembers.tsx`, DB migration

---

### Phase 6: Crew Hub — Commodity Broadcast & Creative Packages (Priority: MEDIUM)

**Commodity Crew Broadcast:**
- When client books commodity crew (waiters, bouncers, pandits), create order with `crew_type: 'commodity'`
- Edge function `crew-broadcast`: sends WhatsApp notifications to all available commodity crew in the area
- First to accept via token link gets assigned (similar to existing `vendor-action` pattern)

**Creative Crew Packages:**
- Vendors with `crew_type: 'creative'` can create packages via `packages` jsonb field
- PDP shows package cards: "Silver Wedding Photo Package — ₹46,000" with deliverables list
- Direct booking or Custom RFQ button

**Files:** `ProductDetail.tsx`, `InventoryManager.tsx`, new edge function `crew-broadcast/index.ts`

---

### Phase 7: Venue Owner CRM Enhancements (Priority: LOW)

- Session Calendar: Already partially built — enhance with color-coded AM/PM/Full Day visual blocks
- Package Builder: Enhance existing `VendorQuoteMaker` to auto-create 24h soft-blocks
- Payment Tracker: Built in Phase 4

---

### Phase 8: Quality Control & Penalties (Priority: LOW — Future)

- GPS check-in on event day (requires mobile app or PWA geolocation API)
- Penalty wallet system (requires payment gateway integration)
- Shadow-ban logic for no-shows
- Deliverable checklist with milestone-linked auto-reminders

**Note:** These require payment gateway (Razorpay/Stripe) and are best built after core booking flow is solid.

---

### Recommended Build Order

| Step | What | Effort |
|------|-------|--------|
| 1 | DB migration: house_rules, amenities_matrix, crew_type, packages, portfolio_urls, instagram_url | Small |
| 2 | Venue search bar with date+slot+event type+guest count | Medium |
| 3 | Crew Hub sub-tabs (commodity vs creative) | Medium |
| 4 | Venue PDP: amenities matrix + house rules | Small |
| 5 | Site visit booking funnel + vendor management | Medium |
| 6 | Payment milestones table + tracker UI | Medium |
| 7 | Event folder system (auto-create on venue booking) | Medium |
| 8 | Commodity crew broadcast edge function | Medium |
| 9 | Creative crew packages on PDP | Small |
| 10 | In-app chat + regex filtering (separate major feature) | Large |
| 11 | GPS check-in + penalty system (future) | Large |

Steps 1-6 can be implemented now. Steps 7-9 follow. Steps 10-11 are future phases requiring additional infrastructure decisions.

