

## Vendor Dashboard Orders Overhaul + Admin Order Filtering

### What Changes

1. **Vendor Past Orders: Split Pending vs Fulfilled** — In the vendor's "Past Orders" tab, separate orders into two sub-tabs: "Pending Orders" (status: new, sent_to_vendors, quoted, accepted, in_progress) and "Completed Orders" (status: completed, confirmed, cancelled).

2. **Vendor orders scoped to their listings only** — Currently `PastOrders` uses `useRentalOrders()` which fetches ALL rental orders (no vendor filter). Fix this to only fetch orders where `assigned_vendor_id = auth.uid()` OR where the order's `vendor_inventory_item_id` matches an item the vendor owns.

3. **Vendor status update on rental orders** — In the JobBoard and PastOrders, add a status update dropdown for accepted/confirmed rental orders so vendors can update status through: `accepted → in_progress → out_for_delivery → delivered → completed`.

4. **Admin Operations: Vendor dropdown + search** — In `LiveRentalOrders.tsx`, add a "Vendor" filter dropdown (populated from assigned vendor profiles) and a search input so admin can filter orders by specific vendor.

---

### Files Changed

| File | Change |
|---|---|
| `src/components/client/PastOrders.tsx` | Add vendor-scoped rental order fetching; split rental orders into "Pending" and "Completed" sub-tabs |
| `src/components/vendor/JobBoard.tsx` | Add status update dropdown for rental orders (accepted → in_progress → delivered → completed) |
| `src/components/admin/LiveRentalOrders.tsx` | Add vendor filter dropdown + search-by-vendor in the filters bar |
| `src/hooks/useRentalOrders.ts` | Add a `useVendorRentalOrders` hook that filters by `assigned_vendor_id` |

---

### Technical Details

**Vendor-scoped orders (PastOrders):**
- Replace `useRentalOrders()` call with a direct Supabase query filtered by `assigned_vendor_id = user.id` (RLS already supports this via "Vendors can view assigned orders" policy)
- Split into `pendingOrders` (status not in completed/confirmed/cancelled) and `completedOrders`
- Show as two sub-tabs within the Rental Orders tab

**Vendor status update (JobBoard):**
- For rental orders with status `accepted` or `confirmed` or `in_progress`, show a Select dropdown with progression statuses
- Use `useUpdateRentalOrder` to update (RLS policy "Vendors can update assigned orders" already permits this)

**Admin vendor filter (LiveRentalOrders):**
- Add a `vendorFilter` state initialized to `"all"`
- Populate dropdown from the already-fetched `vendorProfiles` data
- Filter the orders list client-side by `assigned_vendor_id`
- Add a text search input that searches across vendor name, company name, and order title

