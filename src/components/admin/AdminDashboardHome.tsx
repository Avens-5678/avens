import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { IndianRupee, Users, ShieldCheck, Package, CalendarDays, TrendingUp, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  onNavigate: (group: string, subTab: string) => void;
}

const AdminDashboardHome = ({ onNavigate }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ revenue: 0, activeVendors: 0, pendingItems: 0, totalOrders: 0, totalListings: 0, monthOrders: 0, avgOrder: 0 });
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [
        profileRes,
        revenueRes,
        vendorsRes,
        pendingRes,
        ordersRes,
        listingsRes,
        monthOrdersRes,
        recentRes,
      ] = await Promise.all([
        user ? supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle() : null,
        supabase.from("rental_orders").select("platform_fee").eq("status", "completed"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "vendor"),
        supabase.from("vendor_inventory").select("id, name, vendor_id, categories, created_at, image_url").eq("is_verified", false).eq("is_available", true).order("created_at", { ascending: false }).limit(10),
        supabase.from("rental_orders").select("id", { count: "exact", head: true }),
        supabase.from("vendor_inventory").select("id", { count: "exact", head: true }).eq("is_available", true),
        supabase.from("rental_orders").select("id", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
        supabase.from("rental_orders").select("id, title, client_name, vendor_quote_amount, status, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      setAdminName((profileRes as any)?.data?.full_name?.split(" ")[0] || "Admin");
      const totalRevenue = (revenueRes.data || []).reduce((s: number, r: any) => s + (r.platform_fee || 0), 0);

      // Avg order value
      const completedOrders = (revenueRes.data || []).length;
      const avgOrder = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;

      setMetrics({
        revenue: totalRevenue,
        activeVendors: vendorsRes.count || 0,
        pendingItems: (pendingRes.data || []).length,
        totalOrders: ordersRes.count || 0,
        totalListings: listingsRes.count || 0,
        monthOrders: monthOrdersRes.count || 0,
        avgOrder,
      });
      setPendingItems(pendingRes.data || []);
      setRecentOrders(recentRes.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleVerify = async (id: string, verified: boolean) => {
    // Find the item before removing from list (need vendor_id for notification)
    const item = pendingItems.find((i) => i.id === id);
    await supabase.from("vendor_inventory").update({
      is_verified: verified,
      verified_at: verified ? new Date().toISOString() : null,
    } as any).eq("id", id);
    setPendingItems((prev) => prev.filter((i) => i.id !== id));
    setMetrics((prev) => ({ ...prev, pendingItems: prev.pendingItems - 1 }));

    // WhatsApp: notify vendor their listing was approved
    if (verified && item?.vendor_id) {
      supabase.from("profiles").select("phone, company_name, full_name").eq("user_id", item.vendor_id).maybeSingle()
        .then(({ data: vp }) => {
          if (!vp?.phone) return;
          supabase.functions.invoke("send-whatsapp", {
            body: {
              to: `91${vp.phone.replace(/\D/g, "")}`,
              template_name: "vendor_approved",
              template_params: [vp.company_name || vp.full_name || "Vendor", "evnting.com/vendor/dashboard"],
              recipient_name: vp.company_name || vp.full_name,
              recipient_type: "vendor",
            },
          }).catch(() => {});
        });
    }
  };

  const statusColor = (s: string) => {
    if (["confirmed", "active", "completed"].includes(s)) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (["pending", "accepted"].includes(s)) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  const topMetrics = [
    { label: "Total revenue", value: `\u20B9${metrics.revenue.toLocaleString("en-IN")}`, Icon: IndianRupee, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { label: "Active vendors", value: metrics.activeVendors, Icon: Users, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
    { label: "Pending approvals", value: metrics.pendingItems, Icon: ShieldCheck, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { label: "Total orders", value: metrics.totalOrders, Icon: Package, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  ];

  const bottomStats = [
    { label: "Total listings", value: metrics.totalListings, Icon: ShoppingBag },
    { label: "Orders this month", value: metrics.monthOrders, Icon: CalendarDays },
    { label: "Avg order value", value: `\u20B9${metrics.avgOrder.toLocaleString("en-IN")}`, Icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} &middot; {adminName}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {topMetrics.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-2.5`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">Pending approvals</h3>
            {metrics.pendingItems > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded-full">
                {metrics.pendingItems}
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigate("ecommerce", "vendor-inventory")}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all &rarr;
          </button>
        </div>

        {pendingItems.length === 0 ? (
          <div className="text-center py-8">
            <ShieldCheck className="h-10 w-10 mx-auto text-emerald-500/40 mb-3" />
            <p className="text-sm text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      {(item.name || "V").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.categories?.[0] || "Uncategorized"} &middot; {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleVerify(item.id, true)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerify(item.id, false)}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold rounded-lg transition-colors dark:bg-red-900/30 dark:text-red-400"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground">Recent orders</h3>
          <button
            onClick={() => onNavigate("operations", "rental-orders")}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all &rarr;
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2">Client</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-2 py-2">Item</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-2 py-2">Amount</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-2 py-2">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-2.5 font-medium text-foreground truncate max-w-[120px]">{order.client_name || "—"}</td>
                    <td className="px-2 py-2.5 text-muted-foreground truncate max-w-[160px]">{order.title || "—"}</td>
                    <td className="px-2 py-2.5 text-right font-medium text-foreground">
                      {order.vendor_quote_amount ? `\u20B9${Math.round(order.vendor_quote_amount).toLocaleString("en-IN")}` : "TBD"}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <Badge className={`text-[10px] capitalize ${statusColor(order.status)}`}>{order.status}</Badge>
                    </td>
                    <td className="px-5 py-2.5 text-right text-muted-foreground text-xs">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-3 gap-3">
        {bottomStats.map(({ label, value, Icon }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl p-4 text-center">
            <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-base sm:text-lg font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardHome;
