import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "homepage",
  group: "Ecommerce",
  name: "Homepage loads correctly",
  description: "Hero section, 3 category cards, promo banner carousel (min 180px), stats strip, Discover Best Rentals, Best Crew, Top Venues, Recently Viewed, Event Packages bundles, How It Works, footer",
  route: "/ecommerce",
  implementation: "Ecommerce.tsx + PromoBannerCarousel.tsx + EventPackages.tsx + MobileTabBar.tsx",
});

registerFeature({
  id: "search_instant",
  group: "Ecommerce",
  name: "Instant debounced search",
  description: "Results update 300ms after typing. Dynamic result count. Skeleton grid during load. Empty state with category chips.",
  route: "/ecommerce",
  implementation: "Ecommerce.tsx debouncedSearch + useEffect timer + useMemo filtering",
});

registerFeature({
  id: "search_filters",
  group: "Ecommerce",
  name: "Search filters sidebar",
  description: "IMPLEMENTED: availabilityDate useState<Date|null> queries rental_orders for unavailable IDs, marks items with _isUnavailable flag, sorts available-first. Sort dropdown with sortBy state (relevance/price_low/price_high/rating/newest). Category/city/price checkboxes filter via selectedCategories/selectedCities/selectedPriceRanges states. activeFilterCount tracks total. clearAllFilters resets all.",
  route: "/ecommerce",
  implementation: "Ecommerce.tsx: availabilityDate + fetchUnavailableIds useEffect, sortBy useMemo switch, FilterSection components, activeFilterCount, clearAllFilters",
});

registerFeature({
  id: "product_detail",
  group: "Ecommerce",
  name: "Product detail page",
  description: "Image gallery IMPLEMENTED: currentImageIndex state + displayImages from selectedVariant.image_urls with thumbnail strip. Date picker IMPLEMENTED: shadcn Calendar with bookingFrom/bookingTill/fromOpen/tillOpen states, unavailable dates from rental_sub_orders check_in/check_out. Vendor card IMPLEMENTED: useVendorProfile(vendorId) hook. Mobile sticky bar IMPLEMENTED: showStickyBar via IntersectionObserver on ctaRef. Add to Cart IMPLEMENTED: handleAddToCart with computedArea for measurable items. 14+ try/catch/toast/error handling lines.",
  route: "/ecommerce/[id]",
  implementation: "ProductDetail.tsx with shadcn Calendar, useVendorProfile hook, IntersectionObserver sticky bar, handleAddToCart, rental_sub_orders unavailability query",
});

registerFeature({
  id: "whatsapp_share_cards",
  group: "Ecommerce",
  name: "WhatsApp share on product cards",
  description: "Share button on every card. Always visible mobile, hover desktop. Opens wa.me with title, price, URL.",
  route: "/ecommerce",
  implementation: "Ecommerce.tsx grid MessageCircle button, encodeURIComponent, window.open wa.me",
});

registerFeature({
  id: "recently_viewed",
  group: "Ecommerce",
  name: "Recently viewed section",
  description: "Shows last viewed products from localStorage. Count badge. Clear history button. View All link.",
  route: "/ecommerce",
  implementation: "Ecommerce.tsx DiscoveryRow with useRecentlyViewed, clearViewed, onClear prop",
});

registerFeature({
  id: "vendor_storefront",
  group: "Ecommerce",
  name: "Vendor public storefront",
  description: "/vendor/:id shows cover, avatar, name, badges, 4 stats, 3 tabs (Listings/Reviews/About), Message vendor button.",
  route: "/vendor/[id]",
  implementation: "VendorStorefront.tsx with profiles, vendor_inventory, rental_reviews",
});

registerFeature({
  id: "event_packages",
  group: "Ecommerce",
  name: "Event packages on homepage",
  description: "Bundle cards from product_bundles. Savings badge, expandable items list, Book this package adds all items to cart.",
  route: "/ecommerce",
  implementation: "EventPackages.tsx with product_bundles, handleBookBundle",
});
