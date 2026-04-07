import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Package, MessageCircle, ArrowLeft } from "lucide-react";

export default function MyEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [eventOrder, setEventOrder] = useState<any>(null);
  const [subOrders, setSubOrders] = useState<any[]>([]);
  const [vendorProfiles, setVendorProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      setLoading(true);
      const { data: eo } = await supabase
        .from("event_orders")
        .select("*")
        .eq("id", eventId)
        .single();
      const { data: subs } = await supabase
        .from("vendor_sub_orders")
        .select("*")
        .eq("parent_order_id", eventId)
        .order("created_at");

      setEventOrder(eo);
      setSubOrders(subs || []);

      // Fetch vendor profiles
      const vIds = [...new Set((subs || []).map((s: any) => s.vendor_id).filter(Boolean))];
      if (vIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, company_name, full_name, avatar_url, phone")
          .in("user_id", vIds);
        const map: Record<string, any> = {};
        (profiles || []).forEach((p: any) => { map[p.user_id] = p; });
        setVendorProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, [eventId]);

  const statusColor = (s: string) => {
    if (["confirmed", "completed"].includes(s)) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (["pending", "in_progress", "ongoing"].includes(s)) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (s === "cancelled") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl py-10 animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-20 bg-muted rounded-xl" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!eventOrder) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <Package className="h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Event not found</h2>
          <button onClick={() => navigate("/ecommerce")} className="mt-4 text-sm font-medium text-primary">
            Go home &rarr;
          </button>
        </div>
      </Layout>
    );
  }

  const confirmedCount = subOrders.filter((s) => s.status === "confirmed" || s.status === "completed").length;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl py-6 sm:py-10 space-y-6">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{eventOrder.event_name || "My Event"}</h1>
          {eventOrder.event_date && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(eventOrder.event_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${subOrders.length > 0 ? (confirmedCount / subOrders.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{confirmedCount}/{subOrders.length} confirmed</span>
          </div>
        </div>

        {/* Payment confirmed banner */}
        {eventOrder.razorpay_payment_id && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Payment confirmed</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {"\u20B9"}{Number(eventOrder.total_amount || 0).toLocaleString("en-IN")} paid &middot; Booking ID: {eventOrder.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        )}

        {/* Vendor sub-orders */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-3">Your vendors</h3>
          <div className="space-y-4">
            {subOrders.map((sub) => {
              const vendor = vendorProfiles[sub.vendor_id] || {};
              const vendorName = vendor.company_name || vendor.full_name || "Vendor";
              const items = Array.isArray(sub.items) ? sub.items : [];
              return (
                <div key={sub.id} className="bg-card border border-border/60 rounded-xl p-4 space-y-3">
                  {/* Vendor header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {vendor.avatar_url ? (
                        <img src={vendor.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">{vendorName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{vendorName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {"\u20B9"}{Number(sub.sub_total || 0).toLocaleString("en-IN")}
                        {sub.check_in && ` \u00b7 ${new Date(sub.check_in).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                        {sub.check_out && ` \u2192 ${new Date(sub.check_out).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                      </p>
                    </div>
                    <Badge className={`text-[10px] capitalize flex-shrink-0 ${statusColor(sub.status)}`}>{sub.status}</Badge>
                  </div>

                  {/* Items summary */}
                  {items.length > 0 && (
                    <div className="pl-13 space-y-0.5">
                      {items.slice(0, 3).map((item: any, j: number) => (
                        <p key={j} className="text-xs text-muted-foreground">&bull; {item.title || item.name}{item.quantity > 1 ? ` \u00d7 ${item.quantity}` : ""}</p>
                      ))}
                      {items.length > 3 && (
                        <p className="text-xs text-muted-foreground/70">+{items.length - 3} more items</p>
                      )}
                    </div>
                  )}

                  {/* Message vendor */}
                  {vendor.phone && (
                    <button
                      onClick={() => window.open(`https://wa.me/91${vendor.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I have a booking with you on Evnting (Order #${eventOrder.id.slice(0, 8).toUpperCase()})`)}`, "_blank")}
                      className="w-full py-2 border border-border hover:border-primary/30 hover:text-primary rounded-lg text-xs font-medium text-muted-foreground transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Message vendor
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event details */}
        {eventOrder.event_address && (
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Event address</p>
            <p className="text-sm text-foreground">{eventOrder.event_address}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
