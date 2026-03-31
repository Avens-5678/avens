

## Merge Booking Widget into Add to Cart — Remove Duplicate Flows

### Problem
The PDP currently has TWO competing booking paths:
1. **BookingWidget** — date picker + "Book Now" (creates reservation hold, collects customer details inline)
2. **Add to Cart** button — adds item without dates, then Cart page asks for dates again

This confuses users. The screenshot shows both buttons stacked on the same page.

### Solution
Merge into a single flow: **select dates on PDP → Add to Cart with dates → checkout in Cart page** (no more "Book Now" / reservation hold on PDP).

---

### Changes

**1. CartItem interface (`useCart.ts`)**
- Add `booking_from?: string` and `booking_till?: string` fields
- Add `booking_slot?: string` field

**2. Remove BookingWidget as standalone component from PDP (`ProductDetail.tsx`)**
- Remove the `<BookingWidget>` component from the product info column
- Move the date pickers (Booking From / Booking Till) and slot selector directly into the PDP info section, above the Add to Cart button
- When user clicks "Add to Cart":
  - Validate that dates are selected (required)
  - Store `booking_from`, `booking_till`, `booking_slot` in the cart item
  - Navigate to `/cart`
- Remove the "Book Now" button entirely
- Keep the Site Visit CTA for venues (it serves a different purpose)

**3. Cart page (`Cart.tsx`)**
- Remove the Start Date / End Date inputs from the enquiry form (dates now come from cart items)
- Display the selected dates per item in the cart item cards (read-only, from `booking_from`/`booking_till`)
- Use the earliest `booking_from` from cart items as the `event_start_date` for the order
- Use the latest `booking_till` as `event_end_date`

**4. BookingWidget.tsx cleanup**
- Keep the file but simplify it: remove "Book Now" / hold logic, keep only the site-visit form for venues
- OR inline the date pickers directly in ProductDetail and delete BookingWidget entirely (cleaner)

**5. Remove dummy/non-functional buttons audit**
- BookingWidget site-visit form has unreachable code (returns JSX after an earlier return statement at line 370 — the `if (step === "site-visit")` block at line 374 is dead code). Fix by restructuring the component.

### File Changes

| File | Change |
|---|---|
| `src/hooks/useCart.ts` | Add `booking_from`, `booking_till`, `booking_slot` to CartItem |
| `src/pages/ProductDetail.tsx` | Replace BookingWidget with inline date pickers above Add to Cart; pass dates into `addItem()` |
| `src/pages/Cart.tsx` | Remove date inputs from enquiry form; show dates per cart item; derive event dates from cart |
| `src/components/ecommerce/BookingWidget.tsx` | Refactor to only export SiteVisitForm for venues (or remove entirely) |

