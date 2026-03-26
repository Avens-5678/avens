

## Fix Ecommerce Page: Categories, Banners, Discovery View & Data Seeding

### Issues Identified

1. **Categories show when no filter is selected** — Currently the CategoryIconStrip always renders. When no service is selected, it should show a mix of all categories OR be hidden in favor of discovery rows.
2. **Promo banners show for all services** — Banners should be service-specific. Need a `service_type` column on `promo_banners` table. When no filter is selected, show all banners randomly shuffled.
3. **Old grid view visible when no filter is selected** — The `isDiscoveryView` condition works, but the main grid section (lines 512-629) still renders below the discovery rows. It should be hidden when in discovery view.
4. **Scraping not done** — Firecrawl connector is not connected. Need to connect it and scrape WedMeGood for venue/crew categories to seed the database.

---

### Technical Plan

#### Step 1: Database — Add `service_type` to `promo_banners`
- Migration: `ALTER TABLE promo_banners ADD COLUMN service_type text DEFAULT 'rental';`
- This allows filtering banners per service tab

#### Step 2: Fix Ecommerce.tsx layout logic
- **Hide the entire grid section** (sidebar + toolbar + product grid) when `isDiscoveryView` is true — only show discovery rows
- **Hide CategoryIconStrip** when no service is selected (discovery view) — categories only make sense when browsing a specific vertical
- When a service IS selected: show CategoryIconStrip + filtered banners + sidebar + product grid

#### Step 3: Filter promo banners by active service
- Update `PromoBannerCarousel` to accept an optional `serviceType` prop
- When `serviceType` is set, filter banners to only show matching ones
- When no service is selected, show all banners in random order

#### Step 4: Update admin promo banner manager
- Add `service_type` dropdown (rental/venue/crew) to the promo banner creation form

#### Step 5: Connect Firecrawl & scrape venue/crew categories
- Connect the Firecrawl connector
- Create an edge function `firecrawl-scrape` to scrape WedMeGood's venue and vendor category pages
- Extract category names and seed them as rental items with appropriate `service_type` values
- Categories to seed:
  - **Venues**: Banquet Halls, Farmhouses, Hotels & Resorts, Party Halls, Outdoor Venues, Convention Centers, Heritage Venues, Rooftop Venues
  - **Crew**: Photographers, Decorators, Makeup Artists, Caterers, DJs & Music, Choreographers, Event Managers, Anchors & MCs, Mehendi Artists, Florists, Videographers

---

### Files Changed

| File | Change |
|---|---|
| `supabase/migrations/` | Add `service_type` to `promo_banners` |
| `src/pages/Ecommerce.tsx` | Hide grid section in discovery view; hide CategoryIconStrip when no service selected |
| `src/components/ecommerce/PromoBannerCarousel.tsx` | Add `serviceType` prop, filter/shuffle banners accordingly |
| `src/components/admin/PromoBannerManager.tsx` | Add service_type selector |
| `src/integrations/supabase/types.ts` | Auto-updated |
| `supabase/functions/firecrawl-scrape/index.ts` | New edge function for scraping |
| `src/lib/api/firecrawl.ts` | New API client for Firecrawl |

### Scraping Note
Firecrawl connector must be connected first. If it cannot be connected, the venue/crew categories will be hardcoded as seed data via a SQL migration instead.

