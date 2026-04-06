import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEssentialsCart } from "@/stores/essentialsCartStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2, Plus, Minus, ArrowLeft, MapPin, Navigation,
  Clock, Zap, CalendarClock, ShoppingBag, Loader2,
} from "lucide-react";
import { Capacitor } from "@capacitor/core";

type DeliveryType = "express" | "standard" | "scheduled";

const EssentialsCart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch profile for checkout prefill
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });
  const {
    items, removeItem, updateQuantity, clearCart, getSubtotal,
    getItemCount, getDeliveryFee,
  } = useEssentialsCart();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("standard");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee(deliveryType);
  const total = subtotal + deliveryFee;
  const itemCount = getItemCount();

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS not supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          setAddress(data.display_name || `${pos.coords.latitude}, ${pos.coords.longitude}`);
        } catch {
          setAddress(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        }
      },
      () => toast({ title: "Could not detect location", variant: "destructive" })
    );
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!address.trim()) {
      toast({ title: "Please enter delivery address", variant: "destructive" });
      return;
    }
    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      // Group items by vendor
      const vendorId = items[0].vendor_id; // For now single-vendor

      const orderItems = items.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image_url: i.image_url,
      }));

      // Create essential order
      const { data: order, error: orderError } = await supabase
        .from("essential_orders")
        .insert({
          order_number: "", // trigger will generate
          customer_id: user.id,
          vendor_id: vendorId,
          items: orderItems,
          item_count: itemCount,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          delivery_type: deliveryType,
          delivery_address: address,
          delivery_instructions: instructions || null,
          estimated_delivery_minutes:
            deliveryType === "express" ? 45 : deliveryType === "standard" ? 180 : null,
          status: "placed",
          payment_status: "pending",
          payment_method: "online",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create Razorpay order via existing edge function
      const { data: rzpData, error: rzpError } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            amount: total,
            currency: "INR",
            order_id: order.id,
            description: `Evnting Essentials - ${itemCount} item(s)`,
            customer: {
              name: profile?.full_name || "",
              email: user.email || "",
              contact: profile?.phone?.replace(/\D/g, "") || "",
            },
            notes: {
              order_id: order.id,
              order_type: "essentials",
            },
          },
        }
      );

      if (rzpError) throw rzpError;

      // Open Razorpay checkout
      const isNative = Capacitor.isNativePlatform();
      if (isNative) {
        const { Browser } = await import("@capacitor/browser");
        localStorage.setItem(
          "evnting_essentials_pending",
          JSON.stringify({ orderId: order.id })
        );
        await Browser.open({
          url: rzpData.payment_link_url,
          presentationStyle: "fullscreen",
        });
        setIsCheckingOut(false);
        return;
      }

      // Web Razorpay
      if (!window.Razorpay) {
        toast({ title: "Payment system loading, please retry", variant: "destructive" });
        setIsCheckingOut(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "INR",
        name: "Evnting.com",
        description: `Party Supplies - ${itemCount} item(s)`,
        order_id: rzpData.razorpay_order_id,
        handler: async (response: any) => {
          // Verify payment
          const { data: verifyData } = await supabase.functions.invoke(
            "verify-razorpay-payment",
            {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order.id,
              },
            }
          );

          if (verifyData?.success) {
            // Update order
            await supabase
              .from("essential_orders")
              .update({
                payment_status: "paid",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              })
              .eq("id", order.id);

            clearCart();
            toast({ title: "Order placed! 🎉" });
            navigate(`/essentials/orders/${order.id}`);
          } else {
            await supabase
              .from("essential_orders")
              .update({ payment_status: "failed" })
              .eq("id", order.id);
            toast({ title: "Payment verification failed", variant: "destructive" });
          }
        },
        prefill: {
          name: profile?.full_name || "",
          email: user.email || "",
          contact: profile?.phone || "",
        },
        theme: { color: "#059669" },
        modal: {
          ondismiss: () => {
            toast({ title: "Payment cancelled" });
            setIsCheckingOut(false);
          },
        },
      });
      rzp.open();
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({ title: err.message || "Checkout failed", variant: "destructive" });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-bold text-gray-700">Your cart is empty</h2>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Add party supplies to get started
          </p>
          <Button
            onClick={() => navigate("/essentials")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Browse Essentials
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-36">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
            <span className="text-sm text-gray-400 ml-auto">
              {itemCount} item{itemCount > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-4 space-y-4 max-w-2xl">
          {/* Cart items */}
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.product_id} className="flex items-center gap-3 p-3">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-14 h-14 object-contain rounded-lg bg-gray-50 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-bold text-gray-900">
                      {"\u20B9"}{item.price}
                    </span>
                    {item.compare_price && item.compare_price > item.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {"\u20B9"}{item.compare_price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-0 bg-emerald-600 rounded-lg overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="px-2 py-1.5 text-white hover:bg-emerald-700"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-2 text-white text-xs font-bold min-w-[1.5rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="px-2 py-1.5 text-white hover:bg-emerald-700"
                    disabled={item.quantity >= item.max_qty || item.quantity >= item.stock_count}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.product_id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Delivery type */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Delivery Speed</h3>
            <div className="grid grid-cols-3 gap-2">
              {([
                { type: "express" as DeliveryType, label: "Express", time: "30-60 min", fee: 49, icon: Zap },
                { type: "standard" as DeliveryType, label: "Standard", time: "2-4 hours", fee: 29, icon: Clock },
                { type: "scheduled" as DeliveryType, label: "Scheduled", time: "Pick time", fee: subtotal >= 499 ? 0 : 29, icon: CalendarClock },
              ]).map(({ type, label, time, fee, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setDeliveryType(type)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    deliveryType === type
                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className={`h-4 w-4 mx-auto mb-1 ${deliveryType === type ? "text-emerald-600" : "text-gray-400"}`} />
                  <p className="text-xs font-semibold text-gray-800">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
                  <p className={`text-[10px] font-bold mt-1 ${fee === 0 ? "text-emerald-600" : "text-gray-500"}`}>
                    {fee === 0 ? "FREE" : `\u20B9${fee}`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Delivery Address
            </h3>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter full delivery address..."
              rows={2}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetectLocation}
              className="w-full gap-1.5 text-xs"
            >
              <Navigation className="h-3 w-3" /> Use Current Location
            </Button>
            {instructions !== undefined && (
              <Input
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Delivery instructions (optional)"
                className="text-sm"
              />
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Order Summary
            </h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({itemCount} items)</span>
              <span>{"\u20B9"}{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery fee</span>
              <span className={deliveryFee === 0 ? "text-emerald-600 font-semibold" : ""}>
                {deliveryFee === 0 ? "FREE" : `\u20B9${deliveryFee}`}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{"\u20B9"}{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Fixed pay button */}
        <div
          className="fixed bottom-[60px] md:bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 px-4 py-3"
          style={{ paddingBottom: "var(--safe-area-bottom, 0px)" }}
        >
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut || !address.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl text-base font-bold shadow-lg shadow-emerald-600/20"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Pay \u20B9${total.toLocaleString("en-IN")}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EssentialsCart;
