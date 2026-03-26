

## Add 3 New Sections: Category Grid, Stats Bar, How It Works

### 1. "Shop by Category" Image Grid
**New file: `src/components/ecommerce/CategoryGrid.tsx`**

Replace the icon-based `CategoryIconStrip` on the discovery view with a visually rich image-based grid. Each card has a background image (from Unsplash/placeholder), category name overlay with gradient, and click to filter.

- 2x3 grid on desktop, 2x2 on mobile with horizontal scroll for overflow
- Categories: Lighting, Sound & DJ, Stages, Decor & Floral, Tents & Structures, Catering — for rentals (default)
- When a service is active, continue using `CategoryIconStrip` (scrollable strip fits better in catalog mode)
- On click: sets `activeService` + `activeQuickCat` to navigate into that category's catalog
- Each card: rounded-xl, ~160px tall, background image with dark gradient overlay, white text label

Category images will use curated stock image URLs mapped per category keyword.

### 2. Redesigned Stats/Social Proof Bar
**Modify: `src/components/ecommerce/TrustStrip.tsx`**

Transform from a minimal icon+text strip into a visually impactful stats bar with animated counters on scroll (reusing the `IntersectionObserver` pattern from `elegant-stats.tsx`).

- 4 stats in a row: "500+ Events" | "4.8★ Rating" | "200+ Vendors" | "24/7 Support"
- Hardcoded stats (no DB dependency) with animated number counting on scroll
- Background: subtle gradient or muted bg with border top/bottom
- Icons with colored circular backgrounds
- Replaces the current DB-driven trust strip items (those were minimal text items)

### 3. "How It Works" Mini Strip
**New file: `src/components/ecommerce/HowItWorks.tsx`**

A 3-step horizontal strip placed between the banner carousel and the discovery rows.

- 3 steps: `Browse` → `Book Instantly` → `Celebrate`
- Each step: numbered circle + icon + title + one-line description
- Connected by a dashed line or arrow between steps
- Clean, centered layout with subtle background
- Responsive: horizontal on desktop, stacked on mobile

### Section Order in Ecommerce.tsx (Discovery View)

```text
Header
Location Bar
ServiceSelector
PromoBannerCarousel
CategoryGrid          ← NEW (replaces CategoryIconStrip in discovery)
HowItWorks            ← NEW
TrustStrip (redesigned) ← MODIFIED
DiscoverySection (rows)
```

### Files Changed

| File | Change |
|---|---|
| `src/components/ecommerce/CategoryGrid.tsx` | New — image-based category grid with gradient overlays |
| `src/components/ecommerce/HowItWorks.tsx` | New — 3-step process strip (Browse → Book → Celebrate) |
| `src/components/ecommerce/TrustStrip.tsx` | Redesign — animated stats bar with counters replacing DB-driven items |
| `src/pages/Ecommerce.tsx` | Import new components, render CategoryGrid + HowItWorks in discovery view, reorder sections |

