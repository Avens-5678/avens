

## Ecommerce Flow & Dashboard Audit — Issues Found + Improvement Ideas

### Issues to Fix

**1. Duplicate "Book this item" + "Add to Cart" on Product Detail Page**
The PDP shows BOTH a `BookingWidget` (date-based booking with hold system) AND a legacy "Add to Cart (Quick Enquiry)" button below it. These are two competing checkout paths on the same page. The BookingWidget already handles dates + booking. The legacy cart button creates confusion.
- **Fix**: Remove the legacy "Add to Cart (Quick Enquiry)" CTA from PDP. Keep only the BookingWidget for date-based booking AND an "Add to Cart" flow for multi-item enquiries. Clarify the two paths: BookingWidget = instant single-item booking, Cart = multi-item enquiry.

**2. Vendor Dashboard: "My Orders" and "Past Orders" show the same data**
- `OrderTracker` (tab: "orders") uses `useVendorRentalOrders` — splits into Pending vs Completed tabs.
- `PastOrders` (tab: "past-orders") also uses `useVendorRentalOrders` — splits into Pending, Completed, and Events tabs.
- These are essentially duplicate views of the same rental orders data. Vendor sees the same orders in two places.
- **Fix**: Remove "Past Orders" from vendor sidebar entirely. `OrderTracker` already covers both active and completed orders.

**3. Vendor Dashboard: "New Request" tab is irrelevant**
- The vendor dashboard has a "New Request" tab that renders `EventRequestForm` — this is a CLIENT form for submitting event requests. Vendors should not be submitting event requests to themselves.
- **Fix**: Remove the "New Request" sidebar item from vendor dashboard.

**4. Client Dashboard: "Past Orders" uses vendor-scoped hook**
- `PastOrders.tsx` uses `useVendorRentalOrders(user?.id)` which filters by `assigned_vendor_id`. For a CLIENT, this returns nothing because clients are not vendors. Clients should see orders where `client_id = user.id`.
- **Fix**: Create/use a client-scoped query (`client_id = user.id`) for the client dashboard's Past Orders.

**5. EcommerceOrders page filters by email match — fragile**
- `EcommerceOrders.tsx` filters rental orders by `client_email` match against `user.email`. This is fragile (email can change, case issues). Should filter by `client_id = user.id`.
- **Fix**: Filter by `client_id` instead of email.

**6. Fake review count on PDP**
- Line 359: `({Math.floor(Math.random() * 50 + 10)} Reviews)` — shows random fake review counts that change on every render.
- **Fix**: Show actual review count from the reviews query, or hide if no reviews.

**7. Booking dates in sidebar filters don't actually filter products**
- The ecommerce sidebar has "Booking Dates" filter section with check-in/check-out date pickers, but `bookingDates` state is never used in the `filteredRentals` logic. It's a dead filter.
- **Fix**: Either connect it to availability checking or remove it to avoid confusing users.

---

### Improvement Ideas

**A. Unified "Add to Cart" + Booking Flow**
Currently there are two paths: BookingWidget (hold-based) and Cart (enquiry-based). Merge them: when user selects dates in BookingWidget and clicks "Book Now", it should add to cart WITH dates attached, then redirect to cart for checkout. This matches how MMT/OYO work — select dates, then proceed to payment page.

**B. Client Dashboard: Add "My Orders" tab linked to EcommerceOrders**
Client dashboard currently has "My Requests" (event tracker) and "Past Orders" (broken). Replace "Past Orders" with a proper "My Rental Orders" tab that shows the client's rental orders filtered by `client_id`.

**C. Product card should show price per day clearly**
Add "/ day" or "/ event" suffix on product cards in the grid to set pricing expectations upfront.

**D. Wishlist/Save for Later**
The PDP has a Bookmark icon but it does nothing. Either implement save-for-later or remove the button.

**E. Order confirmation page**
After placing an order, user is just shown a toast. Add a proper order confirmation page with order details, estimated timeline, and a "Track Order" CTA.

---

### Recommended Plan (Prioritized)

| # | Change | Files |
|---|---|---|
| 1 | Remove duplicate "Past Orders" from vendor dashboard; keep only "My Orders" (OrderTracker) | `VendorDashboard.tsx` |
| 2 | Remove "New Request" from vendor sidebar (client-only feature) | `VendorDashboard.tsx` |
| 3 | Fix client PastOrders to query by `client_id` instead of `assigned_vendor_id` | `PastOrders.tsx`, `useRentalOrders.ts` |
| 4 | Fix EcommerceOrders to filter by `client_id` instead of email | `EcommerceOrders.tsx` |
| 5 | Remove fake review count on PDP; show real count | `ProductDetail.tsx` |
| 6 | Remove dead booking dates filter from sidebar (not connected to filtering logic) | `Ecommerce.tsx` |
| 7 | Remove non-functional Bookmark button from PDP | `ProductDetail.tsx` |

