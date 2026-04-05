import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "vendor_dashboard_home",
  group: "Vendor Dashboard",
  name: "Vendor dashboard — home",
  description: "IMPLEMENTED: VendorOverview component with 14+ tabs in sections array (5 nav groups). Onboarding check queries vendor_onboarding_progress.is_completed. Mobile primary: overview/orders/chat/inventory/tasks. Overview has metric cards + Recharts revenue chart + quick actions. Bank account banner conditional on profile.status + bank_account check.",
  route: "/vendor/dashboard",
  implementation: "VendorDashboard.tsx: VendorOverview, 14+ tabs in 5 sections, onboarding guard, mobile primary items, Recharts chart",
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
  description: "IMPLEMENTED: channelRef useRef stores single Realtime channel with cleanup on unmount. Initial fetch .limit(50). ChatSkeleton component with 7 animated pulse bars. Pagination: hasMore + pageOffset states, loadEarlierMessages increments offset by 50, range(newOffset, newOffset+49). Realtime: supabase.channel('chat_messages_${id}') on INSERT event. groupByDate groups messages by Today/Yesterday/date. Auto-marks messages read if sender_id !== user.id. 31 error handling lines.",
  route: "/vendor/dashboard",
  implementation: "ChatManager.tsx: channelRef single subscription with cleanup, .limit(50), ChatSkeleton, hasMore/pageOffset pagination, supabase.channel INSERT listener, groupByDate, auto-read marking",
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
  description: "IMPLEMENTED: Pay Salary modal with employee name, month/year Select, amount Input, notes Textarea. handlePaySalary has double-click guard (if payLoading return) + idempotency key. Calls process-salary-payout edge function with try-catch, falls back to manual salary_payments INSERT. Button disabled={payLoading} with Loader2 spinner. Salary Payment History table queries salary_payments .order(paid_at DESC).limit(20) with status badges (paid=emerald, processing=amber, failed=red).",
  route: "/vendor/dashboard",
  implementation: "PayrollManager.tsx: payLoading guard, idempotency_key, process-salary-payout with manual fallback, salary_payments history query, status badge colors",
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
