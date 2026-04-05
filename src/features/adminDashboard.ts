import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "admin_dashboard",
  group: "Admin Dashboard",
  name: "Admin dashboard — overview",
  description: "IMPLEMENTED: 8 parallel Supabase queries via Promise.all (profile, revenue SUM platform_fee, vendors count, pending vendor_inventory is_verified=false, orders count, listings count, month orders, recent 10 orders). handleVerify updates vendor_inventory.is_verified + verified_at with window.confirm before action. WhatsApp via formatWhatsAppPhone + send-whatsapp edge function. Error state with try-catch + Retry button. Skeleton loading. Platform stats row (listings, month orders, avg order).",
  route: "/admin",
  implementation: "AdminDashboardHome.tsx: 8 Promise.all queries, handleVerify with confirm + WhatsApp, error/loading states, recent orders table, platform stats",
});

registerFeature({
  id: "admin_ai_testing",
  group: "Admin Dashboard",
  name: "Admin — AI testing agent",
  description: "Test scenarios with group filter. Run tests. Progress bar. Pass/warning/fail cards. Download Markdown report.",
  route: "/admin",
  implementation: "AITestingAgent.tsx with featureRegistry, ai-test-runner edge function",
});

registerFeature({
  id: "admin_whatsapp",
  group: "Admin Dashboard",
  name: "Admin — WhatsApp panel",
  description: "Message history from whatsapp_message_logs. Manual send form with phone, template, Send button.",
  route: "/admin",
  implementation: "WhatsApp panel fetching whatsapp_message_logs, send-whatsapp function",
});
