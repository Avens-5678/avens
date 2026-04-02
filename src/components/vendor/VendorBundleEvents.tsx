import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Package, Building2, Users, CheckCircle2, Truck, Loader2, Send } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { filterChatContent } from "@/utils/chatContentFilter";

interface BundleItem {
  id: string;
  bundle_order_id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  total_price: number;
  rental_start: string | null;
  rental_end: string | null;
  status: string;
}

interface BundleOrder {
  id: string;
  customer_id: string;
  event_date: string | null;
  status: string;
  categories_included: string[];
}

interface Profile {
  user_id: string;
  full_name: string | null;
}

const STATUS_ACTIONS: Record<string, { next: string; label: string; icon: any; updateType: string }> = {
  pending: { next: "confirmed", label: "Confirm", icon: CheckCircle2, updateType: "confirmation" },
  confirmed: { next: "delivered", label: "Mark Dispatched", icon: Truck, updateType: "dispatch" },
  delivered: { next: "returned", label: "Mark Completed", icon: CheckCircle2, updateType: "completion" },
};

const VendorBundleEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch this vendor's bundle items
  const { data: myItems = [], isLoading } = useQuery({
    queryKey: ["vendor-bundle-items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_order_items")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BundleItem[];
    },
  });

  // Get unique bundle order IDs
  const bundleIds = useMemo(() => [...new Set(myItems.map((i) => i.bundle_order_id))], [myItems]);

  // Fetch bundle orders
  const { data: bundleOrders = [] } = useQuery({
    queryKey: ["vendor-bundle-orders", bundleIds.join(",")],
    enabled: bundleIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_orders")
        .select("id, customer_id, event_date, status, categories_included")
        .in("id", bundleIds);
      if (error) throw error;
      return data as BundleOrder[];
    },
  });

  // Fetch customer profiles
  const customerIds = useMemo(() => [...new Set(bundleOrders.map((b) => b.customer_id))], [bundleOrders]);
  const { data: customerProfiles = [] } = useQuery({
    queryKey: ["vendor-bundle-customers", customerIds.join(",")],
    enabled: customerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", customerIds);
      if (error) throw error;
      return data as Profile[];
    },
  });

  const profileMap = useMemo(() => {
    const m: Record<string, Profile> = {};
    customerProfiles.forEach((p) => { m[p.user_id] = p; });
    return m;
  }, [customerProfiles]);

  const orderMap = useMemo(() => {
    const m: Record<string, BundleOrder> = {};
    bundleOrders.forEach((o) => { m[o.id] = o; });
    return m;
  }, [bundleOrders]);

  // Update item status + post event update
  const updateItemStatus = useMutation({
    mutationFn: async ({ itemId, bundleOrderId, newStatus, updateType, itemName }: {
      itemId: string; bundleOrderId: string; newStatus: string; updateType: string; itemName: string;
    }) => {
      const { error: itemError } = await supabase
        .from("bundle_order_items")
        .update({ status: newStatus } as any)
        .eq("id", itemId);
      if (itemError) throw itemError;

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name, full_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      const vendorName = profile?.company_name || profile?.full_name || "Vendor";

      const messages: Record<string, string> = {
        confirmation: `${vendorName} confirmed "${itemName}"`,
        dispatch: `${vendorName} dispatched "${itemName}"`,
        completion: `${vendorName} completed delivery of "${itemName}"`,
      };

      await supabase.from("bundle_event_updates").insert({
        bundle_order_id: bundleOrderId,
        vendor_id: user!.id,
        update_type: updateType,
        content: messages[updateType] || `${vendorName} updated "${itemName}" to ${newStatus}`,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-bundle-items"] });
      toast({ title: "Status updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Post custom update (with content filter)
  const [updateText, setUpdateText] = useState<Record<string, string>>({});
  const postUpdate = useMutation({
    mutationFn: async ({ bundleOrderId, text }: { bundleOrderId: string; text: string }) => {
      const filtered = filterChatContent(text);
      const content = filtered.shouldFlag ? filtered.sanitized : text;

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name, full_name")
        .eq("user_id", user!.id)
        .maybeSingle();

      await supabase.from("bundle_event_updates").insert({
        bundle_order_id: bundleOrderId,
        vendor_id: user!.id,
        update_type: "message",
        content,
      } as any);

      if (filtered.shouldFlag) {
        await supabase.from("chat_moderation_logs").insert({
          conversation_id: null,
          sender_id: user!.id,
          original_content: text,
          sanitized_content: content,
          detection_type: "regex",
          detected_patterns: filtered.detected,
          severity: filtered.severity,
          action_taken: "masked",
        } as any);
      }
    },
    onSuccess: (_, vars) => {
      setUpdateText((prev) => ({ ...prev, [vars.bundleOrderId]: "" }));
      toast({ title: "Update posted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  if (myItems.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        <Package className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
        No bundle events assigned to you yet.
      </div>
    );
  }

  // Group items by bundle order
  const grouped: Record<string, BundleItem[]> = {};
  myItems.forEach((item) => {
    if (!grouped[item.bundle_order_id]) grouped[item.bundle_order_id] = [];
    grouped[item.bundle_order_id].push(item);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Bundle Events</h2>
        <p className="text-sm text-muted-foreground">{Object.keys(grouped).length} active event{Object.keys(grouped).length !== 1 ? "s" : ""}</p>
      </div>

      {Object.entries(grouped).map(([bundleId, bundleItems]) => {
        const order = orderMap[bundleId];
        const customer = order ? profileMap[order.customer_id] : null;
        const customerName = customer?.full_name || "Customer";
        const maskedName = customerName.split(" ")[0] + (customerName.split(" ")[1] ? " " + customerName.split(" ")[1][0] + "." : "");
        const daysAway = order?.event_date ? differenceInDays(new Date(order.event_date), new Date()) : null;

        return (
          <Card key={bundleId}>
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{maskedName}</p>
                  {order?.event_date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <CalendarIcon className="h-3 w-3" />{format(new Date(order.event_date), "dd MMM yyyy")}
                      {daysAway !== null && daysAway >= 0 && <Badge className="ml-1 text-[9px]">{daysAway === 0 ? "Today" : `${daysAway}d`}</Badge>}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="text-[10px]">{order?.status || "pending"}</Badge>
              </div>

              <Separator />

              {/* Items with status actions */}
              <div className="space-y-2">
                {bundleItems.map((item) => {
                  const action = STATUS_ACTIONS[item.status];
                  return (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.quantity > 1 ? `${item.quantity} × ` : ""}{item.item_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[8px] capitalize">{item.item_type}</Badge>
                          <Badge variant="secondary" className="text-[8px]">{item.status}</Badge>
                          {item.rental_start && (
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(item.rental_start), "dd MMM")}
                              {item.rental_end && ` → ${format(new Date(item.rental_end), "dd MMM")}`}
                            </span>
                          )}
                        </div>
                      </div>
                      {action && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs h-7 flex-shrink-0"
                          onClick={() => updateItemStatus.mutate({
                            itemId: item.id,
                            bundleOrderId: bundleId,
                            newStatus: action.next,
                            updateType: action.updateType,
                            itemName: item.item_name,
                          })}
                          disabled={updateItemStatus.isPending}
                        >
                          <action.icon className="h-3 w-3" />{action.label}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Post custom update */}
              <div className="flex gap-2">
                <Input
                  value={updateText[bundleId] || ""}
                  onChange={(e) => setUpdateText((prev) => ({ ...prev, [bundleId]: e.target.value }))}
                  placeholder="Post an update to the customer..."
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (updateText[bundleId] || "").trim()) {
                      postUpdate.mutate({ bundleOrderId: bundleId, text: updateText[bundleId] });
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  disabled={!(updateText[bundleId] || "").trim() || postUpdate.isPending}
                  onClick={() => postUpdate.mutate({ bundleOrderId: bundleId, text: updateText[bundleId] })}
                >
                  {postUpdate.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VendorBundleEvents;
