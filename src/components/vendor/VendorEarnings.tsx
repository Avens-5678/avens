import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IndianRupee, TrendingUp, Package, CheckCircle2, Clock, Loader2 } from "lucide-react";

const VendorEarnings = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["vendor_orders_earnings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_orders")
        .select("*")
        .eq("assigned_vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const stats = useMemo(() => {
    if (!orders) return { total: 0, confirmed: 0, pending: 0, revenue: 0, thisMonth: 0 };
    const confirmed = orders.filter(o => o.status === "confirmed" || o.status === "completed");
    const pending = orders.filter(o => ["new", "sent_to_vendors", "accepted"].includes(o.status));
    const revenue = confirmed.reduce((sum, o) => sum + (o.vendor_quote_amount || 0), 0);
    const now = new Date();
    const thisMonth = confirmed.filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total: orders.length, confirmed: confirmed.length, pending: pending.length, revenue, thisMonth };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Earnings & Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">Track your performance and revenue</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <p className="text-3xl font-bold">{stats.thisMonth}</p>
            <p className="text-muted-foreground">confirmed orders this month</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {orders && orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 10).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.title}</p>
                    <p className="text-xs text-muted-foreground">{order.client_name} • {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.vendor_quote_amount && (
                      <span className="text-sm font-medium">₹{order.vendor_quote_amount.toLocaleString()}</span>
                    )}
                    <Badge variant={order.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorEarnings;
