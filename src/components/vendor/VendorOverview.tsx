import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee, Package, ClipboardList, Star, ArrowUpRight,
  ArrowDownRight, MessageSquare, ListTodo, Plus, FileText, AlertTriangle, X,
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

interface VendorOverviewProps {
  onNavigate: (tab: string) => void;
}

const VendorOverview = ({ onNavigate }: VendorOverviewProps) => {
  const { user } = useAuth();
  const [bankBannerDismissed, setBankBannerDismissed] = useState(() => localStorage.getItem("bank_banner_dismissed") === "true");

  // Check if bank account is missing
  const { data: profileData } = useQuery({
    queryKey: ["vendor-profile-bank", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("vendor_status, bank_details").eq("user_id", user!.id).single();
      return data;
    },
  });
  const showBankBanner = !bankBannerDismissed && profileData?.vendor_status === "approved" && !profileData?.bank_details;

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ["vendor-overview-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("rental_orders")
        .select("id, title, client_name, status, vendor_payout, created_at")
        .eq("assigned_vendor_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  // Fetch inventory
  const { data: inventory = [] } = useQuery({
    queryKey: ["vendor-overview-inventory", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_inventory")
        .select("id, name, quantity, is_available")
        .eq("vendor_id", user!.id);
      return data || [];
    },
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["vendor-overview-tasks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id")
        .eq("vendor_id", user!.id)
        .eq("status", "todo")
        .limit(50);
      return data || [];
    },
  });

  // Stats
  const today = startOfDay(new Date());
  const todayOrders = orders.filter((o) => new Date(o.created_at) >= today);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.vendor_payout || 0), 0);
  const yesterdayStart = subDays(today, 1);
  const yesterdayOrders = orders.filter((o) => { const d = new Date(o.created_at); return d >= yesterdayStart && d < today; });
  const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + (o.vendor_payout || 0), 0);
  const revenuePctChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
  const pendingOrders = orders.filter((o) => ["new", "sent_to_vendors", "accepted"].includes(o.status)).length;
  const activeProducts = inventory.filter((i: any) => i.is_available).length;
  const lowStockItems = inventory.filter((i: any) => i.quantity != null && i.quantity < 5 && i.is_available);

  // Revenue chart (last 7 days)
  const chartData = useMemo(() => {
    const days: { label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dayStr = format(d, "yyyy-MM-dd");
      const label = format(d, "EEE");
      const rev = orders
        .filter((o) => format(new Date(o.created_at), "yyyy-MM-dd") === dayStr && ["confirmed", "completed", "delivered"].includes(o.status))
        .reduce((s, o) => s + (o.vendor_payout || 0), 0);
      days.push({ label, revenue: Math.round(rev) });
    }
    return days;
  }, [orders]);
  const weekTotal = chartData.reduce((s, d) => s + d.revenue, 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Bank account banner */}
      {showBankBanner && (
        <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }}>
          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Add your bank account to receive payouts</p>
            <p className="text-xs text-amber-700 mt-0.5">You won't receive payment for bookings until your bank account is verified</p>
          </div>
          <button
            onClick={() => onNavigate("profile")}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
          >
            Add now &rarr;
          </button>
          <button
            onClick={() => { setBankBannerDismissed(true); localStorage.setItem("bank_banner_dismissed", "true"); }}
            className="text-amber-400 hover:text-amber-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={IndianRupee} label="Today's Revenue" value={`₹${Math.round(todayRevenue).toLocaleString("en-IN")}`}
          change={revenuePctChange} onClick={() => onNavigate("earnings")}
        />
        <StatCard
          icon={ClipboardList} label="Pending Orders" value={String(pendingOrders)}
          badge={pendingOrders > 0 ? pendingOrders : undefined}
          onClick={() => onNavigate("orders")}
        />
        <StatCard icon={Package} label="Active Products" value={String(activeProducts)} onClick={() => onNavigate("inventory")} />
        <StatCard icon={ListTodo} label="Open Tasks" value={String(tasks.length)} onClick={() => onNavigate("tasks")} />
      </div>

      {/* ── Revenue Chart + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Chart */}
        <Card className="lg:col-span-3 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-medium text-foreground">Revenue (7 days)</h3>
              <span className="text-xs text-muted-foreground">₹{weekTotal.toLocaleString("en-IN")} total</span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-medium text-foreground">Recent Orders</h3>
              <button onClick={() => onNavigate("orders")} className="text-[11px] text-primary hover:underline">View all</button>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-1.5">
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{o.client_name || o.title}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(o.created_at), "dd MMM, h:mm a")}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {o.vendor_payout && <span className="text-[12px] font-medium">₹{Math.round(o.vendor_payout).toLocaleString("en-IN")}</span>}
                      <StatusDot status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Plus, label: "Add Product", tab: "inventory", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
          { icon: FileText, label: "Create Quote", tab: "quotes", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          { icon: MessageSquare, label: "Messages", tab: "chat", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
          { icon: ListTodo, label: "Today's Tasks", tab: "tasks", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
        ].map((action) => (
          <button
            key={action.tab}
            onClick={() => onNavigate(action.tab)}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors text-left"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-[12px] font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>

      {/* ── Low Stock Alerts ── */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <CardContent className="p-4">
            <h3 className="text-[13px] font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5" />Low Stock Alerts
            </h3>
            <div className="space-y-1.5">
              {lowStockItems.slice(0, 4).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-[12px]">
                  <span className="text-foreground">{item.name}</span>
                  <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-700">
                    {item.quantity} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ── Stat Card ──
const StatCard = ({ icon: Icon, label, value, change, badge, onClick }: {
  icon: any; label: string; value: string; change?: number; badge?: number; onClick?: () => void;
}) => (
  <Card className="border-border/50 hover:border-border transition-colors cursor-pointer" onClick={onClick}>
    <CardContent className="p-3.5">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {badge && badge > 0 && (
          <Badge className="bg-red-500 text-white text-[9px] h-4 min-w-[16px] px-1">{badge}</Badge>
        )}
      </div>
      <p className="text-xl font-semibold text-foreground leading-tight">{value}</p>
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        {change !== undefined && change !== 0 && (
          <span className={`flex items-center text-[10px] font-medium ${change > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(Math.round(change))}%
          </span>
        )}
      </div>
    </CardContent>
  </Card>
);

// ── Status dot ──
const StatusDot = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    new: "bg-blue-500", sent_to_vendors: "bg-blue-400", accepted: "bg-blue-400",
    confirmed: "bg-emerald-500", completed: "bg-emerald-600",
    delivered: "bg-teal-500", cancelled: "bg-red-400",
  };
  return <div className={`w-2 h-2 rounded-full ${colors[status] || "bg-gray-400"}`} title={status} />;
};

export default VendorOverview;
