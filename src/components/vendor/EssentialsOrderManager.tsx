import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package, Truck, Check, X, Clock, Zap, CalendarClock,
  Phone, Loader2, ShoppingBag, IndianRupee, ChevronRight,
} from "lucide-react";

type FilterTab = "new" | "active" | "completed" | "cancelled";

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  packing: "bg-amber-100 text-amber-700",
  ready_for_pickup: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

const deliveryIcons: Record<string, any> = {
  express: Zap,
  standard: Clock,
  scheduled: CalendarClock,
};

const EssentialsOrderManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>("new");
  const [handoffOrder, setHandoffOrder] = useState<any | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch orders
  const { data: orders, refetch } = useQuery({
    queryKey: ["vendor-essential-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_orders")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("vendor-essential-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "essential_orders",
          filter: `vendor_id=eq.${user.id}`,
        },
        (payload) => {
          refetch();
          if (payload.eventType === "INSERT") {
            const order = payload.new as any;
            toast({
              title: "New order! 🔔",
              description: `\u20B9${order.total} \u2014 ${order.item_count} items (${order.delivery_type})`,
            });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refetch, toast]);

  // Filter orders
  const filtered = useMemo(() => {
    if (!orders) return [];
    switch (filter) {
      case "new":
        return orders.filter((o) => o.status === "placed");
      case "active":
        return orders.filter((o) => ["confirmed", "packing", "ready_for_pickup", "out_for_delivery"].includes(o.status));
      case "completed":
        return orders.filter((o) => o.status === "delivered");
      case "cancelled":
        return orders.filter((o) => ["cancelled", "refunded"].includes(o.status));
      default:
        return orders;
    }
  }, [orders, filter]);

  // Revenue stats
  const todayRevenue = useMemo(() => {
    if (!orders) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return orders
      .filter((o) => o.status === "delivered" && o.delivered_at?.startsWith(today))
      .reduce((sum, o) => sum + Number(o.total), 0);
  }, [orders]);
  const todayOrders = useMemo(() => {
    if (!orders) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return orders.filter((o) => o.status === "delivered" && o.delivered_at?.startsWith(today)).length;
  }, [orders]);

  const counts = useMemo(() => ({
    new: orders?.filter((o) => o.status === "placed").length || 0,
    active: orders?.filter((o) => ["confirmed", "packing", "ready_for_pickup", "out_for_delivery"].includes(o.status)).length || 0,
    completed: orders?.filter((o) => o.status === "delivered").length || 0,
    cancelled: orders?.filter((o) => ["cancelled", "refunded"].includes(o.status)).length || 0,
  }), [orders]);

  const updateStatus = async (orderId: string, newStatus: string, extras: Record<string, any> = {}) => {
    setUpdating(orderId);
    try {
      const { error } = await supabase
        .from("essential_orders")
        .update({ status: newStatus, ...extras, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;

      // Insert tracking record
      await supabase.from("essential_delivery_tracking").insert({
        order_id: orderId,
        status: newStatus,
        message: `Order ${newStatus.replace(/_/g, " ")}`,
        delivery_partner_name: extras.delivery_partner_name || null,
        delivery_partner_phone: extras.delivery_partner_phone || null,
      });

      refetch();
      toast({ title: `Order ${newStatus.replace(/_/g, " ")}` });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const handleAccept = (orderId: string) => updateStatus(orderId, "confirmed", { vendor_accepted_at: new Date().toISOString() });
  const handleReject = (orderId: string) => updateStatus(orderId, "cancelled", { cancelled_at: new Date().toISOString(), cancellation_reason: "Rejected by vendor" });
  const handleStartPacking = (orderId: string) => updateStatus(orderId, "packing", { packed_at: new Date().toISOString() });
  const handleReady = (orderId: string) => updateStatus(orderId, "ready_for_pickup");

  const handleHandoff = async () => {
    if (!handoffOrder || !partnerName.trim()) {
      toast({ title: "Enter delivery partner name", variant: "destructive" });
      return;
    }
    await updateStatus(handoffOrder.id, "out_for_delivery", {
      picked_up_at: new Date().toISOString(),
      delivery_partner_name: partnerName,
      delivery_partner_phone: partnerPhone,
    });
    setHandoffOrder(null);
    setPartnerName("");
    setPartnerPhone("");
  };

  const handleDelivered = (orderId: string) => updateStatus(orderId, "delivered", { delivered_at: new Date().toISOString() });

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const getNextAction = (order: any) => {
    const isLoading = updating === order.id;
    const btnProps = { disabled: isLoading, size: "sm" as const };

    switch (order.status) {
      case "placed":
        return (
          <div className="flex gap-2">
            <Button {...btnProps} onClick={() => handleAccept(order.id)} className="bg-emerald-600 hover:bg-emerald-700 text-xs flex-1">
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />} Accept
            </Button>
            <Button {...btnProps} variant="outline" onClick={() => handleReject(order.id)} className="text-xs border-red-200 text-red-600 hover:bg-red-50">
              <X className="h-3 w-3 mr-1" /> Reject
            </Button>
          </div>
        );
      case "confirmed":
        return (
          <Button {...btnProps} onClick={() => handleStartPacking(order.id)} className="text-xs w-full">
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Package className="h-3 w-3 mr-1" />} Start Packing
          </Button>
        );
      case "packing":
        return (
          <Button {...btnProps} onClick={() => handleReady(order.id)} className="text-xs w-full">
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />} Ready for Pickup
          </Button>
        );
      case "ready_for_pickup":
        return (
          <Button {...btnProps} onClick={() => setHandoffOrder(order)} className="text-xs w-full bg-purple-600 hover:bg-purple-700">
            <Truck className="h-3 w-3 mr-1" /> Hand to Delivery
          </Button>
        );
      case "out_for_delivery":
        return (
          <Button {...btnProps} onClick={() => handleDelivered(order.id)} className="text-xs w-full bg-emerald-600 hover:bg-emerald-700">
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />} Mark Delivered
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      {filter === "completed" && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Revenue</p>
                <p className="text-lg font-bold">{"\u20B9"}{todayRevenue.toLocaleString("en-IN")}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivered Today</p>
                <p className="text-lg font-bold">{todayOrders}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["new", "active", "completed", "cancelled"] as FilterTab[]).map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab)}
            className="text-xs capitalize gap-1 flex-shrink-0"
          >
            {tab}
            {counts[tab] > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filter === tab ? "bg-white/20" : "bg-primary/10 text-primary"
              }`}>
                {counts[tab]}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No {filter} orders</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => {
            const items = order.items as any[];
            const DeliveryIcon = deliveryIcons[order.delivery_type] || Clock;

            return (
              <Card key={order.id}>
                <CardContent className="py-3 px-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{order.order_number}</p>
                        <Badge className={`text-[10px] py-0 ${statusColors[order.status] || ""}`}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <DeliveryIcon className={`h-3.5 w-3.5 ${order.delivery_type === "express" ? "text-red-500" : "text-muted-foreground"}`} />
                      <span className={`font-medium capitalize ${order.delivery_type === "express" ? "text-red-600" : "text-muted-foreground"}`}>
                        {order.delivery_type}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">{"\u20B9"}{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-border/50">
                      <span>Total ({order.item_count} items)</span>
                      <span>{"\u20B9"}{order.total}</span>
                    </div>
                  </div>

                  {/* Delivery address */}
                  <p className="text-xs text-muted-foreground truncate">
                    📍 {order.delivery_address}
                  </p>

                  {/* Customer rating */}
                  {order.customer_rating && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-amber-500">{"★".repeat(order.customer_rating)}</span>
                      <span className="text-gray-300">{"★".repeat(5 - order.customer_rating)}</span>
                      {order.customer_review && <span className="text-muted-foreground ml-1">"{order.customer_review}"</span>}
                    </div>
                  )}

                  {/* Action buttons */}
                  {getNextAction(order)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Handoff dialog */}
      <Dialog open={!!handoffOrder} onOpenChange={(open) => !open && setHandoffOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hand to Delivery Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Partner Name *</Label>
              <Input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Delivery partner name" />
            </div>
            <div>
              <Label>Partner Phone</Label>
              <Input value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} placeholder="Phone number" type="tel" />
            </div>
            <Button onClick={handleHandoff} className="w-full">
              <Truck className="h-4 w-4 mr-2" /> Confirm Handoff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EssentialsOrderManager;
