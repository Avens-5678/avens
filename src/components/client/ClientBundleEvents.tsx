import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Package, Building2, Users, ChevronRight, Loader2, Gift } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { CATEGORY_LABELS } from "@/utils/bundleDetection";

interface BundleOrder {
  id: string;
  event_name: string | null;
  event_date: string | null;
  bundle_type: string;
  categories_included: string[];
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const CATEGORY_ICONS: Record<string, any> = { equipment: Package, venue: Building2, crew: Users };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-600",
};

const ClientBundleEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ["client-bundle-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_orders")
        .select("*")
        .eq("customer_id", user!.id)
        .order("event_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as BundleOrder[];
    },
  });

  // Get vendor count per bundle
  const bundleIds = bundles.map((b) => b.id);
  const { data: itemCounts = [] } = useQuery({
    queryKey: ["bundle-vendor-counts", bundleIds.join(",")],
    enabled: bundleIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_order_items")
        .select("bundle_order_id, vendor_id")
        .in("bundle_order_id", bundleIds);
      if (error) throw error;
      return data as { bundle_order_id: string; vendor_id: string }[];
    },
  });

  const vendorCountMap = useMemo(() => {
    const m: Record<string, number> = {};
    const seen: Record<string, Set<string>> = {};
    itemCounts.forEach((ic) => {
      if (!seen[ic.bundle_order_id]) seen[ic.bundle_order_id] = new Set();
      seen[ic.bundle_order_id].add(ic.vendor_id);
    });
    Object.entries(seen).forEach(([bid, vendors]) => { m[bid] = vendors.size; });
    return m;
  }, [itemCounts]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  if (bundles.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Gift className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No events yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Book from multiple categories (Equipment + Venue + Crew) to create a bundle event with a dedicated command center.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">My Events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bundles.map((bundle) => {
          const daysAway = bundle.event_date ? differenceInDays(new Date(bundle.event_date), new Date()) : null;
          const countdown = daysAway === null ? null : daysAway < 0 ? "Completed" : daysAway === 0 ? "Today!" : `${daysAway}d away`;
          const vendorCount = vendorCountMap[bundle.id] || 0;

          return (
            <Card
              key={bundle.id}
              className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
              onClick={() => navigate(`/my-event/${bundle.id}`)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {bundle.event_name || "My Event"}
                    </p>
                    {bundle.event_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <CalendarIcon className="h-3 w-3" />{format(new Date(bundle.event_date), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {countdown && (
                      <Badge className={`text-[10px] ${countdown === "Completed" ? "bg-gray-500" : countdown === "Today!" ? "bg-emerald-600" : "bg-primary"}`}>
                        {countdown}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {bundle.categories_included.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat] || Package;
                    return <Badge key={cat} variant="outline" className="gap-1 text-[10px] capitalize"><Icon className="h-2.5 w-2.5" />{CATEGORY_LABELS[cat] || cat}</Badge>;
                  })}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{vendorCount} vendor{vendorCount !== 1 ? "s" : ""}</span>
                    <Badge variant="secondary" className={`text-[9px] ${STATUS_COLORS[bundle.status] || ""}`}>{bundle.status}</Badge>
                  </div>
                  <span className="text-sm font-bold text-foreground">₹{Math.round(bundle.total_amount).toLocaleString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ClientBundleEvents;
