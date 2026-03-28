

## Fix Availability + Add Amazon-Style Vendor Listing

### Problem 1: Product Detail page doesn't load vendor items
The `ProductDetail` page only queries `useAllRentals()` (the `rentals` table). When a user clicks a vendor-listed item from the ecommerce page, the product detail page can't find it because it's in `vendor_inventory`, not `rentals`. This is why items appear unavailable.

### Problem 2: No vendor branding on product pages
There's no vendor/brand info shown on product cards or product detail pages.

---

### Changes

**1. ProductDetail.tsx — Load from both tables**
- Import `useVerifiedVendorInventory` alongside `useAllRentals`
- Merge both datasets (same mapping logic as Ecommerce.tsx) into a single `allItems` array
- Find the product by `id` from the merged array instead of just `rentals`
- Also try loading variants from `vendor_inventory_variants` when the item source is vendor

**2. ProductDetail.tsx — Add vendor/brand section**
- After the title, add a "Brand" / "Sold by" line showing the vendor's company name
- Query `profiles` table using the `vendor_id` from the vendor_inventory item to get `company_name` and `full_name`
- Make it clickable → navigates to `/ecommerce?vendor={vendor_id}`

**3. Ecommerce.tsx — Vendor filter support**
- Read `vendor` query param from URL
- When present, filter `allItems` to only show items where `_source === "vendor"` and the vendor_id matches
- Show a header banner: "All items by {Company Name}" with a clear filter button
- Add `vendor_id` to the vendor mapped items so it's available for filtering

**4. EnhancedProductCard.tsx — Show vendor badge**
- When item has `_source === "vendor"`, show a small "Sold by: {vendor name}" label on the card
- Pass `vendor_id` and `vendor_name` through the item data

**5. useData.ts — Include vendor_id in verified inventory query**
- The `vendor_inventory` table already has `vendor_id` column
- Update the Ecommerce mapping to include `vendor_id` in the mapped object

**6. New hook: useVendorProfile**
- Simple hook that fetches profile by `user_id` from profiles table
- Returns `company_name`, `full_name`, `avatar_url`
- Used by ProductDetail and optionally by the vendor store page

### Data Flow

```text
Ecommerce Page                    Product Detail Page
─────────────                    ──────────────────
rentals + vendor_inventory  →    rentals + vendor_inventory (merged)
     ↓                                ↓
  allItems[] with _source,       Find item by id from merged list
  vendor_id fields                    ↓
     ↓                          If vendor item → fetch profile
  ?vendor=xyz filter                  ↓
     ↓                          Show "Sold by: Company" → link
  Show only that vendor's items       to /ecommerce?vendor=xyz
```

### Files Changed

| File | Change |
|---|---|
| `src/pages/ProductDetail.tsx` | Load from both tables; add vendor/brand section with link |
| `src/pages/Ecommerce.tsx` | Add `vendor_id` to mapping; support `?vendor=` URL filter with header |
| `src/components/ecommerce/EnhancedProductCard.tsx` | Show "Sold by" label for vendor items |
| `src/hooks/useVendorProfile.ts` | New hook to fetch vendor profile by user_id |
| `src/hooks/useData.ts` | No changes needed (vendor_id already returned by `select("*")`) |

