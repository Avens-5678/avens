import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEssentialsCart } from "@/stores/essentialsCartStore";
import Layout from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, ShoppingBag, Clock, Check, Truck, X, RotateCcw, Star,
} from "lucide-react";

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

const EssentialOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem } = useEssentialsCart();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["essential-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_orders")
        .select("*")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleReorder = (order: any) => {
    const items = order.items as any[];
    items.forEach((item: any) => {
      addItem({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        image_url: item.image_url || "/placeholder.svg",
        max_qty: 50,
        stock_count: 999,
        vendor_id: order.vendor_id,
        quantity: item.quantity,
      });
    });
    toast({ title: `${items.length} item(s) added to cart` });
    navigate("/essentials/cart");
  };

  const activeStatuses = ["placed", "confirmed", "packing", "ready_for_pickup", "out_for_delivery"];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate("/essentials")}>
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-4 max-w-2xl space-y-3">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && (!orders || orders.length === 0) && (
            <div className="text-center py-16">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No orders yet</h3>
              <p className="text-sm text-gray-400 mt-1 mb-6">
                Your party supply orders will appear here
              </p>
              <Button
                onClick={() => navigate("/essentials")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Browse Essentials
              </Button>
            </div>
          )}

          {orders?.map((order) => {
            const items = order.items as any[];
            const isActive = activeStatuses.includes(order.status);
            const isDelivered = order.status === "delivered";
            const canRate = isDelivered && !order.customer_rating;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {order.order_number}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      statusColors[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {items.slice(0, 3).map((item: any, i: number) => (
                      <img
                        key={i}
                        src={item.image_url || "/placeholder.svg"}
                        alt=""
                        className="w-8 h-8 rounded-lg border-2 border-white bg-gray-50 object-contain"
                      />
                    ))}
                    {items.length > 3 && (
                      <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        +{items.length - 3}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {order.item_count} item{order.item_count !== 1 ? "s" : ""} {"\u00B7"} {"\u20B9"}{order.total}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {isActive && (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/essentials/orders/${order.id}`)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs flex-1"
                    >
                      <Truck className="h-3 w-3 mr-1" /> Track Order
                    </Button>
                  )}
                  {isDelivered && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(order)}
                        className="text-xs flex-1"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Reorder
                      </Button>
                      {canRate && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/essentials/orders/${order.id}`)}
                          className="text-xs flex-1 border-amber-200 text-amber-600 hover:bg-amber-50"
                        >
                          <Star className="h-3 w-3 mr-1" /> Rate
                        </Button>
                      )}
                    </>
                  )}
                  {!isActive && !isDelivered && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/essentials/orders/${order.id}`)}
                      className="text-xs"
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default EssentialOrders;
