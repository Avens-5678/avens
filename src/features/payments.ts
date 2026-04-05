import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "razorpay_integration",
  group: "Payments",
  name: "Razorpay — end to end",
  description: "Edge function creates order. Modal opens. Success -> verify -> event_orders -> vendor_sub_orders -> WhatsApp -> cart cleared -> /event/:id",
  route: "/cart",
  implementation: "create-razorpay-order + verify-razorpay-payment edge functions, Cart.tsx handler",
});

registerFeature({
  id: "venue_holds",
  group: "Payments",
  name: "Venue holds and site visit payments",
  description: "Site visit booking + venue hold via Razorpay. Separate flows from cart.",
  route: "/ecommerce/[venue-id]",
  implementation: "Venue detail Razorpay flows, venue_holds + site_visit_requests tables",
});

registerFeature({
  id: "payroll_payments",
  group: "Payments",
  name: "Payroll — salary payment",
  description: "Pay Salary -> process-salary-payout edge function -> salary_payments table. History table with status.",
  route: "/vendor/dashboard",
  implementation: "process-salary-payout edge function, salary_payments, PayrollManager history",
});
