import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "vendor_dashboard_home",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — home",
  description: "Greeting, 4 metric cards, 7-day Recharts chart, Recent Orders, quick actions, Low Stock Alerts, bank account amber banner.",
  route: "/vendor/dashboard",
  implementation: "VendorDashboard.tsx overview with VendorOverview, metrics, Recharts, bank banner",
});

registerFeature({
  id: "vendor_orders",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — orders",
  description: "rental_orders + vendor_sub_orders for this vendor. Client name, items, amount, dates, status.",
  route: "/vendor/dashboard",
  implementation: "Vendor orders fetching rental_orders + vendor_sub_orders where vendor_id matches",
});

registerFeature({
  id: "vendor_inventory",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — inventory",
  description: "All vendor listings. Add product form. Stock levels. Date-based availability. Variant management.",
  route: "/vendor/dashboard",
  implementation: "Inventory tab with vendor_inventory + rental_variants tables",
});

registerFeature({
  id: "vendor_chat",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — chat",
  description: "Last 50 messages with skeleton. Single channelRef Realtime. Load earlier pagination. Real-time new messages.",
  route: "/vendor/dashboard",
  implementation: "ChatManager.tsx channelRef, .limit(50), ChatSkeleton, hasMore/pageOffset",
});

registerFeature({
  id: "vendor_bundle_manager",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — My Packages",
  description: "4-step bundle creation (basics, select listings min 2, set price min 70%, review). product_bundles INSERT. List with toggle/delete.",
  route: "/vendor/dashboard",
  implementation: "VendorBundleManager.tsx, product_bundles table",
});

registerFeature({
  id: "vendor_employees",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — employees",
  description: "Team members list. Add form. bank_account, ifsc, account_holder_name fields.",
  route: "/vendor/dashboard",
  implementation: "Employee management with employees table, bank detail columns",
});

registerFeature({
  id: "vendor_payroll",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — payroll",
  description: "Pay Salary modal per employee. process-salary-payout edge function. Salary Payment History table.",
  route: "/vendor/dashboard",
  implementation: "PayrollManager.tsx, process-salary-payout, salary_payments table",
});

registerFeature({
  id: "vendor_tasks",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — tasks",
  description: "Task list with status columns. Add task form. Status updates.",
  route: "/vendor/dashboard",
  implementation: "Task manager with tasks table",
});

registerFeature({
  id: "vendor_quotes",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — quotes",
  description: "Offline quotes. Create form with line items. Status tracking.",
  route: "/vendor/dashboard",
  implementation: "Quotes tab with quotes + quote_line_items tables",
});

registerFeature({
  id: "vendor_deliveries",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — deliveries",
  description: "Delivery orders. Driver contact with WhatsApp. Status updates. Google Maps.",
  route: "/vendor/dashboard",
  implementation: "Deliveries tab with delivery_orders table, WhatsApp CTA",
});

registerFeature({
  id: "vendor_spending",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — spending",
  description: "Expenses, budget alerts, analytics. Earnings breakdown. Offline Booking entry.",
  route: "/vendor/dashboard",
  implementation: "Finance tabs with expenses + budgets tables, earnings from rental_orders",
});

registerFeature({
  id: "vendor_reviews",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — reviews",
  description: "All reviews received. Rating breakdown. Reply functionality.",
  route: "/vendor/dashboard",
  implementation: "Reviews tab fetching rental_reviews where vendor_id matches",
});

registerFeature({
  id: "vendor_site_visits",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — site visits",
  description: "Site visit requests. Update status. WhatsApp notification on confirmation.",
  route: "/vendor/dashboard",
  implementation: "SiteVisitManager.tsx, site_visit_requests, WhatsApp on confirm",
});
