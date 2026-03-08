

# Professional Product Detail Page + Quick Cart Sidebar

## What We're Building

1. **Quick Cart Slide-out Panel** — When user clicks "Add to Cart" on the PDP, a right-side sheet slides in showing:
   - Cart items with images, prices, quantities
   - "You May Also Like" section with 4-6 random products from the same category
   - Subtotal summary
   - "View Cart & Enquire" CTA + "Continue Shopping" button

2. **Professional Product Detail Page** — Upgrade the PDP to use the same EcommerceHeader (consistent navigation), add:
   - "You May Also Like" horizontal scroll section at the bottom
   - Trust badges below the Add to Cart button (Free Delivery, Assured Quality, etc.)
   - Better visual hierarchy with rating display and share button

## Files to Create/Modify

### New: `src/components/ecommerce/QuickCartSheet.tsx`
- Uses Radix Sheet (slide from right)
- Shows cart items (image, title, price, qty, remove)
- "Suggested Products" section: pulls 4-6 random rentals excluding current cart items
- Each suggestion has image + title + price + "View" button that navigates to PDP
- Footer: subtotal + "View Cart" button + "Continue Shopping" button

### Modified: `src/pages/ProductDetail.tsx`
- Replace `<Layout>` with `<Layout hideNavbar>` + `<EcommerceHeader>` for consistent e-commerce navigation
- Add QuickCartSheet — opens automatically after "Add to Cart"
- Add trust badges row below CTA (Assured Quality, Free Delivery, 24/7 Support)
- Add "You May Also Like" section at bottom with horizontal scroll of same-category products
- Add rating display with stars if rental has rating

### Modified: `src/components/ecommerce/EnhancedProductCard.tsx`
- No major changes, already professional

## Technical Details
- QuickCartSheet receives `open`/`onOpenChange` props + `allRentals` for suggestions
- Suggestions filtered: same category as current product, exclude items already in cart, randomized, limit 6
- Uses existing `useCart` Zustand store
- Sheet uses `@radix-ui/react-dialog` via the existing `sheet.tsx` component
- Recently viewed tracking via localStorage (store last 10 product IDs)

