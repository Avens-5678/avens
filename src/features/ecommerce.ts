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
  description: "Category, location, price range, availability date filter (grays out booked items via rental_orders), sort dropdown (Relevance/Price/Rating/Newest)",
  route: "/ecommerce",
  implementation: "Ecommerce.tsx filter sidebar, availabilityDate, fetchUnavailableIds",
});

registerFeature({
  id: "product_detail",
  group: "Ecommerce",
  name: "Product detail page",
  description: "Image gallery with thumbnails + fullscreen. Date picker with unavailable dates red (rental_orders). Live price calc. Vendor info card. Reviews. Mobile sticky CTA.",
  route: "/ecommerce/[id]",
  implementation: "ProductDetail.tsx with shadcn Calendar, unavailableDates, vendor from profiles, rental_reviews",
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
