# Professional Product Detail Page Upgrade

Redesign the PDP to match Amazon/Flipkart conventions with better visual hierarchy, structured information sections, and a polished layout.

## Key Changes to `src/pages/ProductDetail.tsx`

### 1. Image Gallery — Desktop: Left thumbnails strip + main image (like Amazon)

- Vertical thumbnail strip on the left (desktop), horizontal on mobile
- Main image with zoom-on-hover effect (CSS `transform: scale(2)` inside overflow-hidden on mouse move)
- Image counter badge stays on mobile

### 2. Product Info — Structured sections with clear dividers

- **Title area**: Category breadcrumb-style tags above title, then title
- **Rating row**: Green rating pill (like Flipkart), review count placeholder, share button, wishlist-style bookmark
- **Evnting Assured**: Horizontal strip with icon + "7 Day Easy Returns · Free Delivery · Top Rated"
- **Variant selectors**: Image-backed variant chips when variant has images, bordered pills otherwise
- **Quantity / Dimensions**: Same logic, cleaner styling
- **CTA row**: Two buttons side-by-side — "Add to Cart" (outline) + "Enquire Now" (primary filled), Flipkart-style
- **Trust badges**: Horizontal icon row (same 3 badges, inline instead of grid)

### 3. Below-the-fold content — Tabbed or accordion sections

- **Description** tab with the existing description text
- **Specifications** section (if description has structured content, parse it; otherwise just description)
- **Reviews placeholder** — "Be the first to review" with a subtle CTA

### 4. "You May Also Like" — Card-style with price + rating + Add to Cart quick button

- Larger cards (w-48 on mobile, w-56 on desktop)
- Each card shows image, title, price, rating pill, and a small "Add to Cart" icon button

### 5. Recently Viewed Section

- Pull from localStorage, show horizontal scroll of recently viewed products (exclude current)

### 6. Sticky Mobile Bottom Bar

- On mobile, a fixed bottom bar with price summary + "Add to Cart" button (like Flipkart mobile PDP)
- Only shows when scrolled past the main CTA

## Files Modified

- `src/pages/ProductDetail.tsx` — Full rewrite of the JSX layout

## Technical Notes

- No new dependencies needed
- Zoom effect: pure CSS with `onMouseMove` tracking for `transform-origin`
- Sticky bottom bar uses `IntersectionObserver` on the main CTA to toggle visibility
- All existing logic (variants, cart, pricing, measurable units) preserved exactly