

## Move "How It Works" + Auto-Scroll on Service Selection

### Changes

**File: `src/pages/Ecommerce.tsx`**

1. **Reorder sections in discovery view**: Move `<HowItWorks />` from its current position (after TrustStrip) to after the `<DiscoverySection />` (after "Discover Best Rentals" row). New order:
   - ServiceSelector → TrustStrip → PromoBannerCarousel → DiscoverySection (Best Rentals, Best in City, etc.) → HowItWorks

2. **Auto-scroll to promo banner on service click**: Wrap `setActiveService` in a handler that, after setting the service, scrolls to the `PromoBannerCarousel`. Add an `id="promo-banner"` to the PromoBannerCarousel section wrapper, then use `scrollIntoView({ behavior: "smooth" })` after a short timeout when a service is selected.

### Files Changed

| File | Change |
|---|---|
| `src/pages/Ecommerce.tsx` | Move HowItWorks below DiscoverySection; add scroll-to-promo on service selection; add id to PromoBannerCarousel wrapper |

