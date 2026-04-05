import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "mobile_tab_bar",
  group: "Mobile & UX",
  name: "Mobile bottom tab bar",
  description: "5 tabs hidden md+. Home, Search (focuses input), Cart (count badge), Events, Account. Active indigo. pb-16 md:pb-0.",
  route: "/ecommerce",
  implementation: "MobileTabBar.tsx in Layout.tsx, hidden md:hidden, useCart count",
});

registerFeature({
  id: "image_fallbacks",
  group: "Mobile & UX",
  name: "Image fallbacks and New badge",
  description: "No-image products show category SVG. 0-rating shows New emerald badge. Assured badge for is_verified || is_featured || rating >= 4.",
  route: "/ecommerce",
  implementation: "EnhancedProductCard.tsx categoryFallbacks, New badge, isAssured logic",
});

registerFeature({
  id: "sticky_header",
  group: "Mobile & UX",
  name: "Sticky header on scroll",
  description: "Header sticky with shadow + frosted glass after 60px scroll. Mobile/desktop rows compact.",
  route: "/ecommerce",
  implementation: "EcommerceHeader.tsx scrolled useState + scroll event listener",
});
