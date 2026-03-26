

## 3 Features: Top Picks, Hover Quick Preview, Mobile Bottom Nav

### 1. "Top Picks for You" Personalized Row

**What**: Track items the user clicks on in `localStorage`, then show a "Top Picks for You" discovery row with items from similar categories they haven't viewed yet.

**How**:
- Create `src/hooks/useRecentlyViewed.ts` — stores last 10 viewed item IDs in `localStorage` key `evnting_recently_viewed`
- Expose `addViewed(id)` and `recentIds` from the hook
- In `Ecommerce.tsx`, compute `topPicksForYou` by:
  1. Getting categories from recently viewed items
  2. Filtering `allItems` for items in those categories that aren't in the viewed list
  3. Showing up to 12 items
- Add a `DiscoveryRow` titled "Top Picks for You" in the discovery view section (after existing rows)
- Also add a "Recently Viewed" row showing the actual viewed items
- Call `addViewed(rental.id)` in `EnhancedProductCard` on click (before navigating)

### 2. Product Card Hover Quick Preview (Desktop Only)

**What**: On desktop hover, show a tooltip/popover with key specs (description, specs, availability, rating breakdown) without navigating.

**How**:
- In `EnhancedProductCard.tsx`, wrap the card in a `HoverCard` (from existing `@/components/ui/hover-card`)
- The `HoverCardTrigger` is the card itself
- `HoverCardContent` shows:
  - Full title
  - First 3 specifications from `rental.specifications`
  - Amenities (if venue), experience level (if crew)
  - Full description (line-clamped to 4 lines)
  - "View Details →" link
- Only render `HoverCard` on non-mobile (use `useIsMobile` hook) — on mobile, just render the card directly
- Add `openDelay={400}` to avoid accidental triggers

### 3. Mobile Bottom Navigation Bar (Swiggy/Zepto-style)

**What**: Fixed bottom nav with 4 icons: Home, Browse, Cart, Account — replaces the floating cart button on mobile.

**How**:
- Create `src/components/ecommerce/MobileBottomNav.tsx`
- Fixed bar at bottom, 4 items:
  - 🏠 **Home** → `/` 
  - 📂 **Browse** → scrolls to top / toggles service selector
  - 🛒 **Cart** (with badge count) → `/cart`
  - 👤 **Account** → `/auth` or dashboard based on auth state
- Styled: `fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border` with `safe-area-inset-bottom` padding
- Only visible on mobile (`md:hidden`)
- In `Ecommerce.tsx`:
  - Import and render `MobileBottomNav` passing cart count
  - Hide the floating cart button on mobile (show only on `hidden sm:flex` or similar)

### Files Changed

| File | Change |
|---|---|
| `src/hooks/useRecentlyViewed.ts` | New hook — localStorage tracking of viewed items |
| `src/pages/Ecommerce.tsx` | Add Top Picks + Recently Viewed discovery rows; import MobileBottomNav; hide floating cart on mobile |
| `src/components/ecommerce/EnhancedProductCard.tsx` | Add HoverCard wrapper for desktop; call `addViewed` on click |
| `src/components/ecommerce/MobileBottomNav.tsx` | New component — fixed bottom nav with Home, Browse, Cart, Account |

