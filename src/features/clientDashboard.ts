import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "client_dashboard",
  group: "Client Dashboard",
  name: "Client dashboard — home",
  description: "Greeting + name. 4 metrics: Active Bookings, Total Spent, Upcoming Events, Reviews Given. Upcoming bookings list. Empty state with Browse vendors. 3 quick actions.",
  route: "/client/dashboard",
  implementation: "ClientDashboardHome.tsx with rental_orders + rental_reviews metrics, upcoming bookings",
});
