import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Sparkles, Download, FlaskConical } from "lucide-react";

interface TestScenario {
  id: string;
  name: string;
  description: string;
  route: string;
  implementation: string;
}

interface TestResult extends TestScenario {
  status: "pass" | "fail" | "warning";
  summary: string;
  what_was_checked: string;
  potential_issues: string[];
  suggested_fix: string | null;
}

const TEST_SCENARIOS: TestScenario[] = [
  { id: "homepage", name: "Homepage loads correctly", description: "Verify the ecommerce homepage renders with all sections: hero, category cards, promo banner, product sections, stats strip, how it works", route: "/ecommerce", implementation: "React SPA with PromoBannerCarousel, EventPackages, stats strip, MobileTabBar" },
  { id: "search", name: "Search returns results", description: "Debounced search queries rentals table with text filter, returns results within 300ms, skeleton shows during load", route: "/ecommerce", implementation: "Ecommerce.tsx with debouncedSearch state, useMemo filtering, availabilityDate filter, sort dropdown" },
  { id: "product_detail", name: "Product detail page", description: "Product page shows image gallery, date picker with unavailable dates, vendor card, reviews, mobile sticky bar", route: "/ecommerce/[id]", implementation: "ProductDetail.tsx with shadcn Calendar, rental_orders unavailability fetch, vendor from profiles, reviews from rental_reviews" },
  { id: "google_maps", name: "Google Maps address picker", description: "Cart shows Google Maps with Places autocomplete, pin drop, GPS button, confirmation card. Leaflet fully removed.", route: "/cart", implementation: "GoogleMapPicker.tsx using @googlemaps/js-api-loader, venue_lat/venue_lng saved to rental_orders" },
  { id: "cart", name: "Cart — event name + vendor groups + conflict detection", description: "Cart shows event name input (localStorage), items grouped by vendor_id, date conflict detection blocking checkout, platform fee line item", route: "/cart", implementation: "Cart.tsx with eventName state, vendorGroups reduce, dateConflicts useMemo, proceed button disabled on conflict" },
  { id: "payment_plans", name: "Payment plan selection", description: "Cart shows payment options: Pay Advance, Pay Full Amount, Pay in Parts. Razorpay triggers correctly.", route: "/cart", implementation: "Cart.tsx payment plan cards with Razorpay edge functions" },
  { id: "vendor_dashboard", name: "Vendor dashboard home", description: "Vendor dashboard shows greeting, 4 metric cards (revenue, orders, products, tasks), revenue chart, quick actions, low stock alerts", route: "/vendor/dashboard", implementation: "VendorDashboard.tsx with VendorOverview component and Recharts revenue chart" },
  { id: "client_dashboard", name: "Client dashboard", description: "Client dashboard shows greeting, 4 metric cards (bookings, spent, upcoming, reviews), upcoming bookings list, 3 quick action buttons", route: "/client/dashboard", implementation: "ClientDashboardHome.tsx fetching from rental_orders and rental_reviews" },
  { id: "admin_dashboard", name: "Admin dashboard", description: "Admin dashboard shows platform metrics, pending vendor approvals with approve/reject buttons, recent orders table", route: "/admin", implementation: "AdminDashboardHome.tsx with pending vendor_inventory query and inline approve/reject mutations" },
  { id: "bundles", name: "Bundle events display", description: "Event Packages section appears on ecommerce homepage, vendors can create bundles via My Packages tab, Book this package adds all items to cart", route: "/ecommerce", implementation: "EventPackages.tsx + VendorBundleManager.tsx with product_bundles table" },
  { id: "vendor_storefront", name: "Vendor storefront page", description: "Public /vendor/:id page shows cover photo, avatar, stats, 3 tabs (Listings/Reviews/About), Message vendor button", route: "/vendor/[id]", implementation: "VendorStorefront.tsx fetching from profiles, vendor_inventory, rental_reviews" },
  { id: "my_event", name: "My Event page", description: "After checkout, /event/:id page shows event name, payment confirmation, vendor sub-orders with status, progress bar, Message vendor buttons", route: "/event/[id]", implementation: "MyEventPage.tsx with event_orders + vendor_sub_orders tables" },
  { id: "mobile_tabs", name: "Mobile bottom tab bar", description: "MobileTabBar shows on mobile (hidden md+) with 5 tabs: Home/Search/Cart/Events/Account. Cart badge shows item count.", route: "/ecommerce", implementation: "MobileTabBar.tsx in Layout.tsx with pb-16 md:pb-0 on main content" },
  { id: "whatsapp_share", name: "WhatsApp share on cards", description: "Every product card has WhatsApp share button. Always visible on mobile, hover on desktop. Opens wa.me with title, price, and direct link.", route: "/ecommerce", implementation: "Ecommerce.tsx grid with MessageCircle button and window.open wa.me link" },
  { id: "whatsapp_triggers", name: "WhatsApp booking notifications", description: "5 trigger points: booking confirmed, vendor new sub-order, vendor listing approved, enquiry submitted, site visit confirmed. All fire-and-forget.", route: "N/A (server-side)", implementation: "send-whatsapp edge function called from Cart.tsx createEventOrder, AdminDashboardHome handleVerify, SiteVisitManager updateVisit" },
  { id: "payroll", name: "Payroll salary payments", description: "Pay Salary button enabled in payroll, processes via edge function with manual fallback, salary payment history table shows below payroll", route: "/vendor/dashboard?tab=payroll", implementation: "PayrollManager.tsx with handlePaySalary calling process-salary-payout, salary_payments table query" },
];

const AITestingAgent = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set(TEST_SCENARIOS.map((t) => t.id)));
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const toggleAll = () => {
    if (selected.size === TEST_SCENARIOS.length) setSelected(new Set());
    else setSelected(new Set(TEST_SCENARIOS.map((t) => t.id)));
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const runTests = async () => {
    const testsToRun = TEST_SCENARIOS.filter((t) => selected.has(t.id));
    setRunning(true);
    setResults([]);
    setProgress(0);

    for (let i = 0; i < testsToRun.length; i++) {
      const test = testsToRun[i];
      setCurrentTest(test.name);
      setProgress(Math.round((i / testsToRun.length) * 100));

      try {
        const { data, error } = await supabase.functions.invoke("ai-test-runner", {
          body: {
            test_name: test.name,
            test_description: test.description,
            test_route: test.route,
            test_implementation: test.implementation,
          },
        });

        if (error) throw error;

        const parsed = data as { status: string; summary: string; what_was_checked: string; potential_issues: string[]; suggested_fix: string | null };
        setResults((prev) => [...prev, {
          ...test,
          status: (parsed.status as "pass" | "fail" | "warning") || "warning",
          summary: parsed.summary || "No summary",
          what_was_checked: parsed.what_was_checked || test.description,
          potential_issues: parsed.potential_issues || [],
          suggested_fix: parsed.suggested_fix || null,
        }]);
      } catch (err: any) {
        setResults((prev) => [...prev, {
          ...test,
          status: "warning",
          summary: "AI check failed \u2014 verify manually",
          what_was_checked: test.description,
          potential_issues: [err.message || "Unknown error"],
          suggested_fix: null,
        }]);
      }

      await new Promise((r) => setTimeout(r, 600));
    }

    setProgress(100);
    setRunning(false);
    setCurrentTest(null);
  };

  const downloadReport = () => {
    const pass = results.filter((r) => r.status === "pass").length;
    const fail = results.filter((r) => r.status === "fail").length;
    const warn = results.filter((r) => r.status === "warning").length;

    const report = [
      "# Evnting Platform QA Report",
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      `Results: ${pass} passed \u00b7 ${warn} warnings \u00b7 ${fail} failed`,
      "",
      ...results.map((r) =>
        [
          `## ${r.status === "pass" ? "\u2705" : r.status === "fail" ? "\u274c" : "\u26a0\ufe0f"} ${r.name}`,
          `Status: ${r.status.toUpperCase()}`,
          `Summary: ${r.summary}`,
          `Checked: ${r.what_was_checked}`,
          r.potential_issues?.length ? `Issues: ${r.potential_issues.join(", ")}` : "",
          r.suggested_fix ? `Fix: ${r.suggested_fix}` : "",
          "",
        ].filter(Boolean).join("\n")
      ),
    ].join("\n");

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evnting-qa-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const warnCount = results.filter((r) => r.status === "warning").length;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT — Test suite */}
      <div className="lg:w-80 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Test scenarios</h3>
          <button onClick={toggleAll} className="text-[10px] text-primary hover:text-primary/80 font-medium">
            {selected.size === TEST_SCENARIOS.length ? "Deselect all" : "Select all"}
          </button>
        </div>

        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {TEST_SCENARIOS.map((test) => (
            <label key={test.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Checkbox
                checked={selected.has(test.id)}
                onCheckedChange={() => toggle(test.id)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs text-foreground">{test.name}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={runTests}
            disabled={running || selected.size === 0}
            size="sm"
            className="flex-1 gap-1.5"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
            {running ? `Testing... (${progress}%)` : `Run ${selected.size} test${selected.size !== 1 ? "s" : ""}`}
          </Button>
          {results.length > 0 && !running && (
            <Button variant="outline" size="sm" onClick={downloadReport} className="gap-1">
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT — Results */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Running indicator */}
        {running && currentTest && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">Testing: {currentTest}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Summary row */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Passed", count: passCount, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "Warnings", count: warnCount, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "Failed", count: failCount, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && !running && (
          <div className="text-center py-16">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">Select tests and click Run</p>
            <p className="text-xs text-muted-foreground mt-1">AI will check each feature and report issues</p>
          </div>
        )}

        {/* Result cards */}
        <div className="space-y-3">
          {results.map((result) => (
            <div key={result.id} className="bg-card border border-border/60 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {result.status === "pass" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : result.status === "fail" ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{result.name}</h4>
                    <Badge className={`text-[9px] ${
                      result.status === "pass" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      result.status === "fail" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>{result.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{result.summary}</p>
                  {result.potential_issues?.length > 0 && (
                    <div className="space-y-0.5 mt-1">
                      {result.potential_issues.map((issue, i) => (
                        <p key={i} className="text-[11px] text-amber-600 dark:text-amber-400">&bull; {issue}</p>
                      ))}
                    </div>
                  )}
                  {result.suggested_fix && (
                    <div className="bg-muted/50 rounded-lg p-2 mt-1.5">
                      <p className="text-[11px] text-muted-foreground"><span className="font-medium text-foreground">Fix:</span> {result.suggested_fix}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITestingAgent;
