import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "whatsapp_booking",
  group: "WhatsApp & Notifications",
  name: "WhatsApp — booking confirmed",
  description: "After Razorpay success + createEventOrder, booking_confirmed template sent to customer. Non-blocking.",
  route: "/cart",
  implementation: "Cart.tsx post-payment WhatsApp call with booking_confirmed template",
});

registerFeature({
  id: "whatsapp_vendor_order",
  group: "WhatsApp & Notifications",
  name: "WhatsApp — new order to vendor",
  description: "After vendor sub-order created, new_order_vendor template sent to vendor phone.",
  route: "/cart",
  implementation: "Cart.tsx vendor notification after vendor_sub_orders INSERT",
});

registerFeature({
  id: "whatsapp_vendor_approved",
  group: "WhatsApp & Notifications",
  name: "WhatsApp — vendor approved",
  description: "Admin Approve click sends vendor_approved template to vendor.",
  route: "/admin",
  implementation: "AdminDashboardHome.tsx handleVerify WhatsApp after approval",
});

registerFeature({
  id: "whatsapp_site_visit",
  group: "WhatsApp & Notifications",
  name: "WhatsApp — site visit confirmation",
  description: "Vendor confirms site visit -> WhatsApp to customer.",
  route: "/vendor/dashboard",
  implementation: "SiteVisitManager.tsx updateVisit WhatsApp on status=confirmed",
});
