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
  description: "IMPLEMENTED: Script tag loading with callback= param (no deprecated Loader class). MAP_STYLE array for silver theme. google.maps.places.Autocomplete restricted to India (componentRestrictions: {country:'in'}). GPS via navigator.geolocation.getCurrentPosition with 10s timeout. Marker draggable:true with orange icon (#F97316). reverseGeocode via google.maps.Geocoder extracts formatted_address + postal_code. Confirmation card with confirmed state toggle.",
  route: "/cart",
  implementation: "GoogleMapPicker.tsx: script tag + callback loading, MAP_STYLE, Places Autocomplete country:in, GPS handler, draggable Marker, Geocoder reverseGeocode, confirmed state card",
});

registerFeature({
  id: "checkout_flow",
  group: "Cart & Checkout",
  name: "Checkout — Razorpay payment flow",
  description: "IMPLEMENTED: window.Razorpay modal opens after create-razorpay-order edge function. handler async verifies via verify-razorpay-payment. createEventOrder() inserts event_orders (customer_id, total_amount, platform_fee, razorpay_payment_id) then vendor_sub_orders per vendor. WhatsApp sent via formatWhatsAppPhone validation + send-whatsapp edge function (non-blocking). clearCart only called AFTER createEventOrder returns valid ID. Navigate to /event/:id. 75+ error handling lines in Cart.tsx.",
  route: "/cart",
  implementation: "Cart.tsx: createEventOrder inserts event_orders+vendor_sub_orders, Razorpay handler with verify edge function, formatWhatsAppPhone before all sends, clearCart guarded by createEventOrder success",
});

registerFeature({
  id: "my_event_page",
  group: "Cart & Checkout",
  name: "My Event page post-checkout",
  description: "IMPLEMENTED: event_orders fetch by eventId .single(). vendor_sub_orders fetch by parent_order_id .order(created_at). Vendor profiles batch query .in('user_id', vIds) with dedup via new Set. Progress bar: confirmedCount/subOrders.length * 100%. Status badges: emerald(confirmed/completed), amber(pending/in_progress), red(cancelled). Message button opens wa.me with order ID. Skeleton loading state. 404 fallback for missing events.",
  route: "/event/[id]",
  implementation: "MyEventPage.tsx: event_orders.eq(id,eventId).single(), vendor_sub_orders.eq(parent_order_id), profiles.in(user_id,vIds), progress bar %, statusColor map, wa.me link, skeleton + 404",
});

registerFeature({
  id: "my_orders",
  group: "Cart & Checkout",
  name: "My Orders page",
  description: "Orders at /ecommerce/orders with order cards (item, dates, amount, status). Browse Shop CTA when empty.",
  route: "/ecommerce/orders",
  implementation: "Orders page fetching rental_orders where client_id = user.id",
});
