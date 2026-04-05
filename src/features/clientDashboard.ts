import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "client_dashboard",
  group: "Client Dashboard",
  name: "Client dashboard — home",
  description: "IMPLEMENTED: Time-based greeting (hour<12/17). 6 parallel Supabase queries: profile, active orders (status in confirmed/active), spent (SUM vendor_quote_amount where completed), upcoming (event_date>=today), reviews (by reviewer_email), bookings list (gte event_date, ASC, limit 3). Error state with try-catch + Retry. Skeleton loading. Status badges: emerald(confirmed/active), amber(pending). Quick actions: Browse vendors, My bookings, Get help (WhatsApp). Empty state with Browse vendors CTA.",
  route: "/client/dashboard",
  implementation: "ClientDashboardHome.tsx: 6 Promise.all queries, greeting logic, error/loading states, statusColor map, 3 quick actions, empty state CTA",
});
