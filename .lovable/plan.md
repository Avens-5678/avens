

## Move Availability Calendar Inline Per Item + Unified Dashboard

### Problem
The current Availability Calendar is a separate global tab that requires vendors to select an item from a dropdown — it's disconnected from the actual inventory items. Vendors who list venues, rentals, AND crew need per-item calendars because availability differs per item (a venue can be booked morning while a rental is available all day).

### Solution
**One unified dashboard** with the calendar embedded directly under each inventory item card. Remove the standalone "Calendar" sidebar tab entirely.

---

### Changes

**1. Remove Calendar sidebar tab (`VendorDashboard.tsx`)**
- Remove `CalendarDays` / "Calendar" entry from `sidebarItems`
- Remove `AvailabilityCalendar` import and its `case "calendar"` in `renderContent()`

**2. Add inline calendar toggle to each item card (`InventoryManager.tsx`)**
- Add a `CalendarDays` icon button to each item card's action row (next to Edit/Delete)
- Clicking it expands/collapses an `ItemAvailabilityCalendar` component below the card content
- Track expanded state: `expandedCalendarId` (string | null)

**3. New component: `ItemAvailabilityCalendar.tsx`**
- Receives `itemId` and `serviceType` as props
- Uses `useVendorAvailability(itemId)` to fetch availability for that specific item
- Uses `useToggleBookedDate()` to toggle dates
- For **venues**: shows slot selector (Morning / Evening / Full Day) — venues commonly have session-based booking
- For **rentals**: shows Full Day only by default (equipment is rented by the day)
- For **crew**: shows slot selector (Morning / Evening / Full Day) — crew can do multiple gigs per day
- Compact single-month calendar with color-coded modifiers (red = fully booked, amber = partial, white = available)
- Shows a small list of upcoming booked dates below the calendar
- Uses the existing `useToggleBookedDate` mutation which already handles slot via `notes` field — will update to pass `slot` properly via the insert payload

**4. Fix `useToggleBookedDate` slot handling**
- Currently stores slot in `notes` field as text — change to pass `slot` as a proper column value in the insert
- The `vendor_availability` table already has a `slot` column (used by `get_available_inventory` function)
- Update the delete logic to also match by `slot`

### File Summary

| File | Change |
|---|---|
| `src/pages/vendor/VendorDashboard.tsx` | Remove "Calendar" sidebar item |
| `src/components/vendor/InventoryManager.tsx` | Add calendar toggle button per item, render `ItemAvailabilityCalendar` inline |
| `src/components/vendor/ItemAvailabilityCalendar.tsx` | New — compact per-item calendar with service-type-aware slot logic |
| `src/hooks/useVendorAvailability.ts` | Fix slot handling in insert/delete mutations |
| `src/components/vendor/AvailabilityCalendar.tsx` | Can be deleted (replaced by per-item version) |

