

## Vendor Multi-Type Listings (Rentals, Venues, Crew)

### The Problem
Currently, `vendor_inventory` has no `service_type` column. Vendors can only list generic equipment. There's no way for a vendor who owns a venue or provides crew services to list those — and no way for those listings to appear in the ecommerce page's Venues or Crew Hub tabs.

### What We're Building

**1. Add `service_type` to `vendor_inventory`** — so vendors can list items as `rental`, `venue`, or `crew`.

**2. Add venue/crew-specific columns to `vendor_inventory`** — mirror the `rentals` table: `amenities` (text[]), `guest_capacity` (text), `experience_level` (text).

**3. Update Vendor InventoryManager** — add a service type selector at the top of the create/edit form. When "Venue" is selected, show amenities checkboxes and guest capacity field. When "Crew" is selected, show experience level dropdown.

**4. Update Admin VendorInventoryAdmin** — add service type filter tab (All / Rentals / Venues / Crew). Show venue/crew-specific fields in the detail view. Admin can edit any listing.

**5. Surface vendor listings in the ecommerce page** — merge `vendor_inventory` items (where `is_verified = true`) into the discovery rows and product grid alongside admin `rentals`, filtered by the active service tab.

### Architecture

```text
vendor_inventory table
├── service_type: 'rental' | 'venue' | 'crew'  (new, default 'rental')
├── amenities: text[]                            (new, for venues)
├── guest_capacity: text                         (new, for venues)
├── experience_level: text                       (new, for crew)
└── existing columns stay unchanged

Vendor Dashboard (InventoryManager)
├── Service Type selector in form
├── Conditional venue/crew fields
└── Categories auto-filtered by service_type

Admin (VendorInventoryAdmin)
├── Tab filter: All | Rentals | Venues | Crew
├── View/edit venue & crew fields
└── Verify listings as before

Ecommerce Page
├── Fetch both `rentals` + verified `vendor_inventory`
├── Merge into unified product list
├── Filter by service_type matching active tab
└── Show "Vendor Listing" badge on vendor items
```

### Implementation Steps

| Step | File(s) | Change |
|---|---|---|
| 1 | Migration SQL | Add `service_type`, `amenities`, `guest_capacity`, `experience_level` to `vendor_inventory` |
| 2 | `src/components/vendor/InventoryManager.tsx` | Add service type selector + conditional venue/crew fields in create/edit form |
| 3 | `src/hooks/useVendorInventory.ts` | Update interfaces to include new fields |
| 4 | `src/components/admin/VendorInventoryAdmin.tsx` | Add service type filter tabs, show new fields in detail/edit view |
| 5 | `src/hooks/useData.ts` | Add hook to fetch verified vendor inventory for ecommerce |
| 6 | `src/pages/Ecommerce.tsx` | Merge vendor listings into the product grid, filtered by active service tab |
| 7 | `src/components/ecommerce/EnhancedProductCard.tsx` | Add "Vendor" badge for vendor-sourced items |

### Database Migration
```sql
ALTER TABLE vendor_inventory
  ADD COLUMN IF NOT EXISTS service_type text NOT NULL DEFAULT 'rental',
  ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS guest_capacity text,
  ADD COLUMN IF NOT EXISTS experience_level text;
```

### Key Decisions
- Vendor listings appear in the ecommerce page **only if `is_verified = true`** (admin must verify first)
- Vendor items get a small "Vendor" badge on the product card to differentiate from in-house catalog
- Categories in the vendor form auto-adjust based on selected service type (same category sets as the admin rental form)
- No new tables needed — we extend the existing `vendor_inventory` table

