import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Phone, Check, Package, Truck, MapPin, Clock,
  ShoppingBag, X, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "packing", label: "Packing", icon: Package },
  { key: "ready_for_pickup", label: "Ready", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const STATUS_INDEX: Record<string, number> = {};
STATUS_STEPS.forEach((s, i) => (STATUS_INDEX[s.key] = i));

const EssentialOrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch order
  const { data: order, refetch } = useQuery({
    queryKey: ["essential-order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_orders")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch tracking entries
  const { data: tracking } = useQuery({
    queryKey: ["essential-tracking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_delivery_tracking")
        .select("*")
        .eq("order_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`essential-order-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "essential_orders", filter: `id=eq.${id}` },
        () => refetch()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "essential_delivery_tracking", filter: `order_id=eq.${id}` },
        () => refetch()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, refetch]);

  const currentStepIdx = order ? (STATUS_INDEX[order.status] ?? 0) : 0;
  const isCancelled = order?.status === "cancelled" || order?.status === "refunded";
  const isDelivered = order?.status === "delivered";
  const canCancel = order && (order.status === "placed" || order.status === "confirmed");

  // Delivery partner from latest tracking
  const latestTracking = tracking?.[0];

  // Estimated time
  const estimatedMinutes = order?.estimated_delivery_minutes;
  const orderTime = order?.created_at ? new Date(order.created_at) : null;
  const etaTime = orderTime && estimatedMinutes
    ? new Date(orderTime.getTime() + estimatedMinutes * 60000)
    : null;
  const now = new Date();
  const minutesLeft = etaTime ? Math.max(0, Math.round((etaTime.getTime() - now.getTime()) / 60000)) : null;

  const handleCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from("essential_orders")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: "Cancelled by customer",
        })
        .eq("id", order.id);
      if (error) throw error;
      toast({ title: "Order cancelled" });
      refetch();
    } catch (err: any) {
      toast({ title: err.message || "Failed to cancel", variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  };

  const orderItems = order?.items as any[] || [];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate("/essentials/orders")}>
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">
                Order {order?.order_number || "..."}
              </h1>
              {order?.created_at && (
                <p className="text-[11px] text-gray-400">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-4 space-y-4 max-w-2xl">
          {/* ETA banner */}
          {!isCancelled && !isDelivered && minutesLeft !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  Arriving in ~{minutesLeft} minute{minutesLeft !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-emerald-600">
                  Estimated by {etaTime?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )}

          {/* Cancelled banner */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <X className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm font-bold text-red-700">Order Cancelled</p>
                {order?.cancellation_reason && (
                  <p className="text-xs text-red-500">{order.cancellation_reason}</p>
                )}
              </div>
            </div>
          )}

          {/* Delivered banner */}
          {isDelivered && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <Check className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Delivered!</p>
                {order?.delivered_at && (
                  <p className="text-xs text-emerald-600">
                    {new Date(order.delivered_at).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress steps */}
          {!isCancelled && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="space-y-0">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i <= currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  const Icon = step.icon;

                  // Get timestamp
                  let timestamp: string | null = null;
                  if (order) {
                    if (step.key === "placed") timestamp = order.created_at;
                    if (step.key === "confirmed") timestamp = order.vendor_accepted_at;
                    if (step.key === "packing") timestamp = order.packed_at;
                    if (step.key === "out_for_delivery") timestamp = order.picked_up_at;
                    if (step.key === "delivered") timestamp = order.delivered_at;
                  }

                  return (
                    <div key={step.key} className="flex gap-3">
                      {/* Vertical line + dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          } ${isCurrent && !isDelivered ? "ring-4 ring-emerald-100" : ""}`}
                        >
                          {isDone && !isCurrent ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${
                              i < currentStepIdx ? "bg-emerald-500" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* Label + timestamp */}
                      <div className="pt-1 pb-4">
                        <p
                          className={`text-sm font-medium ${
                            isDone ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                          {isCurrent && !isDelivered && (
                            <span className="inline-flex ml-2">
                              <span className="animate-pulse text-emerald-500 text-xs">...</span>
                            </span>
                          )}
                        </p>
                        {timestamp && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery partner info */}
          {order?.status === "out_for_delivery" && latestTracking && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {latestTracking.delivery_partner_name || "Delivery Partner"}
                </p>
                {latestTracking.delivery_partner_phone && (
                  <p className="text-xs text-gray-400">{latestTracking.delivery_partner_phone}</p>
                )}
              </div>
              {latestTracking.delivery_partner_phone && (
                <a
                  href={`tel:${latestTracking.delivery_partner_phone}`}
                  className="bg-emerald-100 p-2.5 rounded-full text-emerald-700 hover:bg-emerald-200"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {/* Order items */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {orderItems.length} Item{orderItems.length !== 1 ? "s" : ""}
            </h3>
            <div className="space-y-3">
              {orderItems.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg bg-gray-50 object-contain"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {"\u20B9"}{item.price} x {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {"\u20B9"}{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{"\u20B9"}{order?.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span>{order?.delivery_fee === 0 ? "FREE" : `\u20B9${order?.delivery_fee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                <span>Total</span>
                <span>{"\u20B9"}{order?.total}</span>
              </div>
            </div>
          </div>

          {/* Cancel button */}
          {canCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EssentialOrderTracking;
