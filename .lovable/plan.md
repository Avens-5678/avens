

## Service-Specific Views + Discovery Sections for /ecommerce

### What We're Building

**1. Service-Specific Filtering** — When Insta-Rent, Venues, or Crew Hub is selected, the entire page adapts:
- **Insta-Rent**: Shows only rental items, rental categories, rental promo banners, rental filters
- **Venues**: Shows only venue-type listings, venue categories (Banquet Halls, Outdoor, Farmhouses, etc.), venue-specific banners
- **Crew Hub**: Shows crew/manpower listings (Decorators, Photographers, Event Managers, DJs, etc.), crew-specific categories

**2. Seed Venue & Crew Categories via Web Scraping** — Use Firecrawl to scrape WedMeGood and similar sites to extract:
- Venue categories (e.g., Banquet Halls, Farmhouses, Hotels, Resorts, Party Halls)
- Crew/vendor categories (e.g., Photographers, Decorators, Makeup Artists, Caterers, DJs, Choreographers)
- These become seeded categories in the `rentals` table; vendors can also add their own listings

**3. Main Page Discovery Rows** — When no service is selected (default landing), show horizontal scrollable rows:
- **"Discover Best Rentals"** — Top-rated or featured rental items with left/right arrows
- **"Discover Best in Hyderabad"** (dynamic city from GPS) — Items filtered by detected city
- **"Best Crew for Your Event"** — Crew/manpower-related items
- **"Top Venues Near You"** — Venue-type items

Each row: section title + horizontal scroll with arrow navigation, showing 4-5 cards.

---

### Technical Plan

#### Step 1: Scrape venue & crew categories (one-time seed)
- Connect Firecrawl connector
- Scrape WedMeGood venue categories page and vendor categories page
- Extract category names to use as seed data for the system

#### Step 2: Add `service_type` field to rentals table
- **Migration**: Add `service_type text DEFAULT 'rental'` column to `rentals` table (values: `rental`, `venue`, `crew`)
- This lets items be tagged as belonging to a specific service vertical
- Update admin rental manager to include service_type selector

#### Step 3: Create `DiscoveryRow` component
- **New file**: `src/components/ecommerce/DiscoveryRow.tsx`
- Horizontal scroll container with ChevronLeft/ChevronRight arrows
- Takes title, items array, renders `EnhancedProductCard` in a row
- Responsive: 2 cards on mobile, 4-5 on desktop

#### Step 4: Refactor Ecommerce.tsx for service-specific views
- **Default view** (no service selected): Show discovery rows instead of full grid
  - "Discover Best Rentals" — items where `service_type = 'rental'`, sorted by rating
  - "Discover Best in {cityName}" — items matching user's detected city
  - "Best Crew for Your Event" — items where `service_type = 'crew'`
  - "Top Venues Near You" — items where `service_type = 'venue'`
- **Service selected** (e.g., Insta-Rent): Show only that service's items in the grid with matching category strip and filters
- Category strip adapts to show only categories relevant to the active service
- Promo banners filter to show only banners linked to items of the active service type

#### Step 5: Update `ServiceSelector` behavior
- Clicking Insta-Rent: `setActiveService("rental")` — filters to rental items only
- Clicking Venues: `setActiveService("venue")` — filters to venue items only  
- Clicking Crew Hub: `setActiveService("crew")` — filters to crew items only (no longer navigates away)

#### Step 6: Update data hooks
- Modify `useAllRentals` or add filtered variants to support `service_type` filtering
- Category strip dynamically shows only categories from items matching the active service

---

### Files Changed
| File | Change |
|---|---|
| `supabase/migrations/` | Add `service_type` column to `rentals` |
| `src/components/ecommerce/DiscoveryRow.tsx` | New horizontal scroll row component |
| `src/pages/Ecommerce.tsx` | Service-specific filtering + discovery rows on default view |
| `src/components/ecommerce/ServiceSelector.tsx` | Remove navigate-away for Crew Hub |
| `src/components/ecommerce/CategoryIconStrip.tsx` | Filter categories by active service |
| `src/components/admin/EnhancedRentalManager.tsx` | Add service_type field to rental form |

