import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "admin_dashboard",
  group: "Admin Dashboard",
  name: "Admin dashboard — overview",
  description: "4 metrics (Revenue, Vendors, Pending, Orders). Pending approvals with Approve/Reject + WhatsApp. Recent orders table. Platform stats.",
  route: "/admin",
  implementation: "AdminDashboardHome.tsx, handleVerify + WhatsApp, recent orders",
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
