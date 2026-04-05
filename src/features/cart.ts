import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "cart_basics",
  group: "Cart & Checkout",
  name: "Cart — core functionality",
  description: "Items with image, name, date range, quantity stepper, price. Remove button. Continue Shopping link. Cart count badge updates.",
  route: "/cart",
  implementation: "Cart.tsx with CartItem components, useCart hook, quantity/remove handlers",
});

registerFeature({
  id: "cart_event_name",
  group: "Cart & Checkout",
  name: "Cart — event name input",
  description: "Event name persists to localStorage evnting_event_name. Pre-fills on reload. Clear button works.",
  route: "/cart",
  implementation: "Cart.tsx eventName useState + useEffect localStorage sync",
});

registerFeature({
  id: "cart_vendor_grouping",
  group: "Cart & Checkout",
  name: "Cart — vendor grouping",
  description: "Items grouped by vendor_id with header (vendor name, subtotal). Single vendor carts show flat list.",
  route: "/cart",
  implementation: "Cart.tsx vendorGroups reduce, vendor fetch from profiles",
});

registerFeature({
  id: "cart_conflict",
  group: "Cart & Checkout",
  name: "Cart — date conflict detection",
  description: "Red banner when items have overlapping booking_from/booking_till. Proceed button disabled.",
  route: "/cart",
  implementation: "Cart.tsx dateConflicts useMemo, hasConflicts disabling button",
});

registerFeature({
  id: "cart_platform_fee",
  group: "Cart & Checkout",
  name: "Cart — price breakdown with platform fee",
  description: "Item subtotal, manpower, transport, platform fee with ? tooltip, GST on platform fee (18%). Coupon input.",
  route: "/cart",
  implementation: "Cart.tsx price breakdown with platformFee, Info tooltip, coupon flow",
});

registerFeature({
  id: "cart_payment_plans",
  group: "Cart & Checkout",
  name: "Cart — 3 payment plans",
  description: "Pay Advance 25%, Pay Full escrow, Pay in Parts EMI. Razorpay triggers on selection.",
  route: "/cart",
  implementation: "Cart.tsx payment plan cards + create-razorpay-order + verify-razorpay-payment",
});

registerFeature({
  id: "cart_google_maps",
  group: "Cart & Checkout",
  name: "Cart — Google Maps address picker",
  description: "Google Maps (not Leaflet). Places autocomplete. GPS button. Pin drop. Confirmation card. venue_lat/lng saved.",
  route: "/cart",
  implementation: "GoogleMapPicker.tsx with @googlemaps/js-api-loader, Places autocomplete",
});

registerFeature({
  id: "checkout_flow",
  group: "Cart & Checkout",
  name: "Checkout — Razorpay payment flow",
  description: "Razorpay modal -> createEventOrder -> event_orders + vendor_sub_orders -> WhatsApp -> cart cleared -> /event/:id",
  route: "/cart",
  implementation: "Cart.tsx createEventOrder after Razorpay, event_orders + vendor_sub_orders + send-whatsapp",
});

registerFeature({
  id: "my_event_page",
  group: "Cart & Checkout",
  name: "My Event page post-checkout",
  description: "/event/:id shows event name, payment card, progress bar, vendor sub-orders with status, Message vendor buttons.",
  route: "/event/[id]",
  implementation: "MyEventPage.tsx fetching event_orders + vendor_sub_orders + profiles",
});

registerFeature({
  id: "my_orders",
  group: "Cart & Checkout",
  name: "My Orders page",
  description: "Orders at /ecommerce/orders with order cards (item, dates, amount, status). Browse Shop CTA when empty.",
  route: "/ecommerce/orders",
  implementation: "Orders page fetching rental_orders where client_id = user.id",
});
