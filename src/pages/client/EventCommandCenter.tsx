import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ArrowLeft, Package, Building2, Users, CalendarIcon,
  CheckCircle2, Clock, Truck, AlertTriangle, MessageSquare,
  IndianRupee, Loader2, Bell,
} from "lucide-react";
import { format, differenceInDays, isToday, formatDistanceToNow } from "date-fns";
import { CATEGORY_LABELS } from "@/utils/bundleDetection";

// ── Types ──
interface BundleOrder {
  id: string;
  customer_id: string;
  event_name: string | null;
  event_date: string | null;
  bundle_type: string;
  categories_included: string[];
  subtotal: number;
  total_amount: number;
  customer_savings: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface BundleItem {
  id: string;
  item_id: string;
  item_type: string;
  vendor_id: string;
  item_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  rental_start: string | null;
  rental_end: string | null;
  status: string;
}

interface EventUpdate {
  id: string;
  bundle_order_id: string;
  vendor_id: string | null;
  update_type: string;
  content: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
}

const CATEGORY_ICONS: Record<string, any> = { equipment: Package, venue: Building2, crew: Users };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};
const UPDATE_ICONS: Record<string, any> = {
  confirmation: CheckCircle2, dispatch: Truck, arrival: Package,
  completion: CheckCircle2, delay: AlertTriangle, message: MessageSquare, system: Bell,
};
const getInitials = (n: string) => n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const EventCommandCenter = () => {
  const { bundleOrderId } = useParams<{ bundleOrderId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Fetch bundle order ──
  const { data: bundle, isLoading } = useQuery({
    queryKey: ["bundle-order", bundleOrderId],
    enabled: !!bundleOrderId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_orders")
        .select("*")
        .eq("id", bundleOrderId!)
        .eq("customer_id", user!.id)
        .single();
      if (error) throw error;
      return data as BundleOrder;
    },
  });

  // ── Fetch items ──
  const { data: items = [] } = useQuery({
    queryKey: ["bundle-items", bundleOrderId],
    enabled: !!bundleOrderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_order_items")
        .select("*")
        .eq("bundle_order_id", bundleOrderId!)
        .order("item_type");
      if (error) throw error;
      return data as BundleItem[];
    },
  });

  // ── Fetch vendor profiles ──
  const vendorIds = useMemo(() => [...new Set(items.map((i) => i.vendor_id))], [items]);
  const { data: profiles = [] } = useQuery({
    queryKey: ["bundle-vendor-profiles", vendorIds.join(",")],
    enabled: vendorIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, avatar_url")
        .in("user_id", vendorIds);
      if (error) throw error;
      return data as Profile[];
    },
  });
  const profileMap = useMemo(() => {
    const m: Record<string, Profile> = {};
    profiles.forEach((p) => { m[p.user_id] = p; });
    return m;
  }, [profiles]);

  // ── Fetch updates ──
  const { data: updates = [] } = useQuery({
    queryKey: ["bundle-updates", bundleOrderId],
    enabled: !!bundleOrderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_event_updates")
        .select("*")
        .eq("bundle_order_id", bundleOrderId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EventUpdate[];
    },
  });

  // ── Realtime subscription for updates ──
  useEffect(() => {
    if (!bundleOrderId) return;
    const channel = supabase
      .channel(`bundle-updates-${bundleOrderId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "bundle_event_updates",
        filter: `bundle_order_id=eq.${bundleOrderId}`,
      }, (payload) => {
        const newUpdate = payload.new as EventUpdate;
        queryClient.setQueryData<EventUpdate[]>(
          ["bundle-updates", bundleOrderId],
          (old) => (old ? [newUpdate, ...old] : [newUpdate])
        );
        toast({ title: "Event Update", description: newUpdate.content });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [bundleOrderId, queryClient, toast]);

  // ── Open or create chat with vendor ──
  const openVendorChat = async (vendorId: string) => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("vendor_id", vendorId)
      .eq("client_id", user.id)
      .eq("type", "client")
      .maybeSingle();
    if (existing) {
      navigate(`/client/dashboard?tab=messages`);
      return;
    }
    const vendorName = profileMap[vendorId]?.company_name || profileMap[vendorId]?.full_name || "Vendor";
    await supabase.from("chat_conversations").insert({
      vendor_id: vendorId, client_id: user.id, type: "client",
      title: vendorName, related_order_id: null,
    } as any);
    navigate(`/client/dashboard?tab=messages`);
  };

  // ── Timeline milestones ──
  const milestones = useMemo(() => {
    if (!bundle) return [];
    const ms: { label: string; date: Date | null; done: boolean; icon: any }[] = [];
    ms.push({ label: "Order placed", date: new Date(bundle.created_at), done: true, icon: CheckCircle2 });

    // Group items by vendor
    const byVendor: Record<string, BundleItem[]> = {};
    items.forEach((i) => { if (!byVendor[i.vendor_id]) byVendor[i.vendor_id] = []; byVendor[i.vendor_id].push(i); });

    Object.entries(byVendor).forEach(([vid, vendorItems]) => {
      const name = profileMap[vid]?.company_name || profileMap[vid]?.full_name || "Vendor";
      const allConfirmed = vendorItems.every((i) => i.status === "confirmed" || i.status === "delivered" || i.status === "returned");
      ms.push({ label: `${name} confirmed`, date: null, done: allConfirmed, icon: CheckCircle2 });

      vendorItems.forEach((item) => {
        if (item.item_type === "equipment" && item.rental_start) {
          ms.push({ label: `${item.item_name} delivery — ${format(new Date(item.rental_start), "dd MMM")}`, date: new Date(item.rental_start), done: item.status === "delivered" || item.status === "returned", icon: Truck });
        }
        if (item.item_type === "crew" && item.rental_start) {
          ms.push({ label: `${item.item_name} arriving — ${format(new Date(item.rental_start), "dd MMM")}`, date: new Date(item.rental_start), done: item.status === "delivered" || item.status === "confirmed", icon: Users });
        }
      });
    });

    if (bundle.event_date) {
      const ed = new Date(bundle.event_date);
      ms.push({ label: `Event day — ${format(ed, "dd MMM yyyy")}`, date: ed, done: ed <= new Date(), icon: CalendarIcon });
    }

    // Equipment return milestones
    items.filter((i) => i.item_type === "equipment" && i.rental_end).forEach((item) => {
      ms.push({ label: `${item.item_name} return due — ${format(new Date(item.rental_end!), "dd MMM")}`, date: new Date(item.rental_end!), done: item.status === "returned", icon: Package });
    });

    return ms.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.getTime() - b.date.getTime();
    });
  }, [bundle, items, profileMap]);

  // ── Countdown ──
  const countdown = useMemo(() => {
    if (!bundle?.event_date) return null;
    const d = differenceInDays(new Date(bundle.event_date), new Date());
    if (d < 0) return "Completed";
    if (d === 0) return "Today!";
    return `${d} day${d !== 1 ? "s" : ""} away`;
  }, [bundle?.event_date]);

  if (isLoading) return <Layout><div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div></Layout>;
  if (!bundle) return <Layout><div className="container mx-auto px-4 py-20 text-center"><h2 className="text-xl font-bold mb-4">Event not found</h2><Button onClick={() => navigate("/client/dashboard")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button></div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-6 space-y-8 max-w-5xl">

        {/* ── Section 1: Event Header ── */}
        <div>
          <button onClick={() => navigate("/client/dashboard?tab=events")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="h-4 w-4" />Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{bundle.event_name || "My Event"}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {bundle.event_date && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <CalendarIcon className="h-3 w-3" />{format(new Date(bundle.event_date), "dd MMM yyyy")}
                  </Badge>
                )}
                {countdown && (
                  <Badge className={countdown === "Completed" ? "bg-gray-500" : countdown === "Today!" ? "bg-emerald-600" : "bg-primary"}>
                    {countdown}
                  </Badge>
                )}
                <Badge variant="secondary" className={STATUS_COLORS[bundle.status] || ""}>{bundle.status}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">₹{Math.round(bundle.total_amount).toLocaleString("en-IN")}</p>
              <Badge variant="secondary" className={`text-[10px] ${bundle.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {bundle.payment_status}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {bundle.categories_included.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || Package;
              return (
                <Badge key={cat} variant="outline" className="gap-1 text-xs capitalize">
                  <Icon className="h-3 w-3" />{CATEGORY_LABELS[cat] || cat}
                </Badge>
              );
            })}
            <Badge variant="outline" className="text-xs">{vendorIds.length} vendor{vendorIds.length !== 1 ? "s" : ""}</Badge>
          </div>
        </div>

        <Separator />

        {/* ── Section 2: Event Timeline ── */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Event Timeline</h2>
          <div className="relative pl-6">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
            {milestones.map((ms, i) => (
              <div key={i} className="relative flex items-start gap-3 pb-5 last:pb-0">
                <div className={`absolute left-[-13px] w-6 h-6 rounded-full flex items-center justify-center z-10 ${ms.done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground border-2 border-border"}`}>
                  <ms.icon className="h-3 w-3" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${ms.done ? "text-foreground" : "text-muted-foreground"}`}>{ms.label}</p>
                  {ms.date && <p className="text-[10px] text-muted-foreground">{format(ms.date, "dd MMM yyyy")}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* ── Section 3: Vendor Cards ── */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Vendors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vendorIds.map((vid) => {
              const profile = profileMap[vid];
              const vendorItems = items.filter((i) => i.vendor_id === vid);
              const vendorName = profile?.company_name || profile?.full_name || "Vendor";
              const categories = [...new Set(vendorItems.map((i) => i.item_type))];
              return (
                <Card key={vid} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {getInitials(vendorName)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{vendorName}</p>
                          <div className="flex gap-1 mt-0.5">
                            {categories.map((cat) => (
                              <Badge key={cat} variant="secondary" className="text-[9px] capitalize">{cat}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => openVendorChat(vid)}>
                        <MessageSquare className="h-3 w-3" />Chat
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      {vendorItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity > 1 ? `${item.quantity} × ` : ""}{item.item_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">₹{Math.round(item.total_price).toLocaleString("en-IN")}</span>
                            <Badge variant="secondary" className={`text-[8px] ${STATUS_COLORS[item.status] || ""}`}>{item.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    {vendorItems[0]?.rental_start && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(vendorItems[0].rental_start), "dd MMM")}
                        {vendorItems[0].rental_end && ` → ${format(new Date(vendorItems[0].rental_end), "dd MMM")}`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* ── Section 4: Event Updates Feed ── */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Event Updates</h2>
          {updates.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-xl">
              <Bell className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No updates yet — your vendors will post updates here as your event approaches.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {updates.map((update) => {
                const Icon = UPDATE_ICONS[update.update_type] || Bell;
                const vendorProfile = update.vendor_id ? profileMap[update.vendor_id] : null;
                const senderName = update.vendor_id ? (vendorProfile?.company_name || vendorProfile?.full_name || "Vendor") : "System";
                return (
                  <div key={update.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${update.update_type === "system" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-primary/10"}`}>
                      <Icon className={`h-4 w-4 ${update.update_type === "system" ? "text-blue-600" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">{senderName}</p>
                        <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{update.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EventCommandCenter;
