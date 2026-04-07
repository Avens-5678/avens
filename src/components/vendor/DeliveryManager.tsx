import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import DeliveryTrackingMap from "@/components/ecommerce/DeliveryTrackingMap";
import {
  Truck, MapPin, Loader2, Camera, Navigation, CheckCircle2,
  Package, Phone, User, Clock,
} from "lucide-react";
import { format } from "date-fns";

interface DeliveryOrder {
  id: string;
  order_id: string | null;
  order_type: string | null;
  customer_id: string | null;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  dropoff_address: string;
  distance_km: number | null;
  duration_minutes: number | null;
  delivery_fee: number;
  fee_breakdown: any;
  scheduled_date: string | null;
  status: string;
  driver_name: string | null;
  driver_phone: string | null;
  driver_lat: number | null;
  driver_lng: number | null;
  delivered_at: string | null;
  delivery_photo_url: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  picked_up: "bg-indigo-100 text-indigo-700",
  in_transit: "bg-primary/10 text-primary",
  delivered: "bg-emerald-100 text-emerald-700",
  returned: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

const DeliveryManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assignDialog, setAssignDialog] = useState<DeliveryOrder | null>(null);
  const [trackingDialog, setTrackingDialog] = useState<DeliveryOrder | null>(null);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [autoTracking, setAutoTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["vendor-deliveries", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_orders")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DeliveryOrder[];
    },
  });

  // Update delivery status + notify customer
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, extras }: { id: string; status: string; extras?: Record<string, any> }) => {
      const updates: any = { status, updated_at: new Date().toISOString(), ...extras };
      if (status === "delivered") updates.delivered_at = new Date().toISOString();
      const { error } = await supabase.from("delivery_orders").update(updates).eq("id", id);
      if (error) throw error;

      // Mirror the delivery status onto the parent rental_orders row so the
      // customer's timeline reflects vendor progress.
      const delivery = deliveries.find((d) => d.id === id);
      const rentalStatusMap: Record<string, string> = {
        picked_up: "in_progress",
        in_transit: "out_for_delivery",
        delivered: "delivered",
      };
      const mirrored = rentalStatusMap[status];
      if (delivery?.order_id && mirrored) {
        await supabase.from("rental_orders")
          .update({ status: mirrored, updated_at: new Date().toISOString() } as any)
          .eq("id", delivery.order_id);
      }

      // Push notification to customer
      if (delivery?.customer_id) {
        const statusLabels: Record<string, string> = { picked_up: "picked up from vendor", in_transit: "on the way", delivered: "delivered" };
        const label = statusLabels[status];
        if (label) {
          supabase.functions.invoke("send-push-notification", {
            body: {
              user_id: delivery.customer_id,
              title: "Delivery Update",
              body: `Your delivery is ${label}!${status === "in_transit" ? " Track it live." : ""}`,
              type: "delivery",
              data: { link: `/track-delivery/${id}` },
            },
          }).catch(() => {});
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["vendor_rental_orders"] });
      queryClient.invalidateQueries({ queryKey: ["client_rental_orders"] });
      queryClient.invalidateQueries({ queryKey: ["rental_orders"] });
      toast({ title: "Status updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Assign driver
  const assignDriver = useMutation({
    mutationFn: async () => {
      if (!assignDialog) return;
      const { error } = await supabase.from("delivery_orders").update({
        driver_name: driverName, driver_phone: driverPhone, status: "assigned", updated_at: new Date().toISOString(),
      } as any).eq("id", assignDialog.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-deliveries"] });
      setAssignDialog(null);
      setDriverName("");
      setDriverPhone("");
      toast({ title: "Driver assigned" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Upload delivery photo
  const uploadDeliveryPhoto = useCallback(async (deliveryId: string, file: File) => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `delivery/${deliveryId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("delivery-photos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("delivery-photos").getPublicUrl(path);
    const { error: updErr } = await supabase.from("delivery_orders").update({
      delivery_photo_url: urlData.publicUrl, status: "delivered", delivered_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    } as any).eq("id", deliveryId);
    if (updErr) {
      toast({ title: "Update failed", description: updErr.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["vendor-deliveries"] });
    toast({ title: "Delivery completed with photo proof" });
  }, [toast, queryClient]);

  // Upload pickup-back (return) photo — vendor proves items were retrieved after the event
  const uploadPickupPhoto = useCallback(async (deliveryId: string, file: File, orderId?: string) => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `pickup/${deliveryId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("delivery-photos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("delivery-photos").getPublicUrl(path);
    const { error: updErr } = await (supabase.from as any)("delivery_orders").update({
      pickup_photo_url: urlData.publicUrl,
      picked_up_at: new Date().toISOString(),
      status: "returned",
      updated_at: new Date().toISOString(),
    }).eq("id", deliveryId);
    if (updErr) {
      toast({ title: "Update failed", description: updErr.message, variant: "destructive" });
      return;
    }
    // Also mark the parent rental order as completed
    if (orderId) {
      await supabase.from("rental_orders").update({ status: "completed" } as any).eq("id", orderId);
    }
    queryClient.invalidateQueries({ queryKey: ["vendor-deliveries"] });
    queryClient.invalidateQueries({ queryKey: ["rental_orders"] });
    queryClient.invalidateQueries({ queryKey: ["client_rental_orders"] });
    toast({ title: "Items picked up — order marked completed" });
  }, [toast, queryClient]);

  // Update driver location
  const updateDriverLocation = useCallback(async (deliveryId: string) => {
    if (!navigator.geolocation) { toast({ title: "Geolocation not supported", variant: "destructive" }); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await supabase.from("delivery_orders").update({
          driver_lat: pos.coords.latitude, driver_lng: pos.coords.longitude,
          driver_updated_at: new Date().toISOString(),
        } as any).eq("id", deliveryId);
        toast({ title: "Location updated" });
      },
      () => toast({ title: "Location access denied", variant: "destructive" }),
      { enableHighAccuracy: true }
    );
  }, [toast]);

  // Auto-tracking toggle
  const toggleAutoTracking = useCallback((deliveryId: string) => {
    if (autoTracking && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setAutoTracking(false);
      toast({ title: "Auto-tracking stopped" });
      return;
    }
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        await supabase.from("delivery_orders").update({
          driver_lat: pos.coords.latitude, driver_lng: pos.coords.longitude,
          driver_updated_at: new Date().toISOString(),
        } as any).eq("id", deliveryId);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    setWatchId(id);
    setAutoTracking(true);
    toast({ title: "Auto-tracking started — location updates every 30s" });
  }, [autoTracking, watchId, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
  }, [watchId]);

  // Keep "delivered" in the active bucket so the vendor still sees the
  // "Pick Up Items + Photo" action after the event finishes. Only fully
  // returned/cancelled rows move to completed.
  const activeDeliveries = deliveries.filter((d) => !["returned", "cancelled"].includes(d.status));
  const completedDeliveries = deliveries.filter((d) => ["returned", "cancelled"].includes(d.status));

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Truck className="h-5 w-5" />Deliveries</h2>
        <p className="text-sm text-muted-foreground">{activeDeliveries.length} active, {completedDeliveries.length} completed</p>
      </div>

      {deliveries.length === 0 ? (
        <div className="text-center py-12"><Truck className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" /><p className="text-sm text-muted-foreground">No deliveries yet.</p></div>
      ) : (
        <div className="space-y-3">
          {/* Active */}
          {activeDeliveries.map((del) => (
            <Card key={del.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={`text-[10px] ${STATUS_COLORS[del.status]}`}>{del.status.replace("_", " ")}</Badge>
                      {del.scheduled_date && <span className="text-[10px] text-muted-foreground">{format(new Date(del.scheduled_date), "dd MMM yyyy")}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">To:</span> {del.dropoff_address}</p>
                    {del.distance_km && <p className="text-[10px] text-muted-foreground">{del.distance_km} km · ₹{Math.round(del.delivery_fee).toLocaleString("en-IN")}</p>}
                  </div>
                  {del.driver_name && (
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Driver contact</p>
                        <p className="font-medium text-foreground">{del.driver_name}</p>
                        {del.driver_phone && <p className="text-muted-foreground">{del.driver_phone}</p>}
                      </div>
                      {del.driver_phone && (
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/91${del.driver_phone?.replace(/\D/g, '')}`, '_blank'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-full transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.35 0-4.536-.685-6.38-1.864l-.446-.295-2.903.973.974-2.903-.295-.446A9.953 9.953 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                          WhatsApp
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {del.status === "pending" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => { setAssignDialog(del); setDriverName(del.driver_name || ""); setDriverPhone(del.driver_phone || ""); }}>
                      <User className="h-3 w-3" />Assign Driver
                    </Button>
                  )}
                  {del.status === "assigned" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => updateStatus.mutate({ id: del.id, status: "picked_up" })}>
                      <Package className="h-3 w-3" />Mark Picked Up
                    </Button>
                  )}
                  {del.status === "picked_up" && (
                    <Button size="sm" className="gap-1 text-xs h-7" onClick={() => updateStatus.mutate({ id: del.id, status: "in_transit" })}>
                      <Truck className="h-3 w-3" />Start Transit
                    </Button>
                  )}
                  {del.status === "in_transit" && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => updateDriverLocation(del.id)}>
                        <Navigation className="h-3 w-3" />Update Location
                      </Button>
                      <Button size="sm" variant={autoTracking ? "destructive" : "outline"} className="gap-1 text-xs h-7" onClick={() => toggleAutoTracking(del.id)}>
                        <MapPin className="h-3 w-3" />{autoTracking ? "Stop Tracking" : "Auto Track"}
                      </Button>
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDeliveryPhoto(del.id, f); }} />
                        <span className="inline-flex items-center gap-1 text-xs h-7 px-3 py-1 border border-border rounded-md hover:bg-muted transition-colors">
                          <Camera className="h-3 w-3" />Deliver + Photo
                        </span>
                      </label>
                    </>
                  )}
                  {del.status === "delivered" && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadPickupPhoto(del.id, f, del.order_id);
                        }}
                      />
                      <span className="inline-flex items-center gap-1 text-xs h-7 px-3 py-1 border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-md hover:bg-emerald-100 transition-colors">
                        <Camera className="h-3 w-3" />Pick Up Items + Photo
                      </span>
                    </label>
                  )}
                  <Button size="sm" variant="ghost" className="gap-1 text-xs h-7" onClick={() => setTrackingDialog(del)}>
                    <MapPin className="h-3 w-3" />View Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Completed */}
          {completedDeliveries.length > 0 && (
            <>
              <Separator />
              <h3 className="text-sm font-semibold text-muted-foreground">Completed ({completedDeliveries.length})</h3>
              {completedDeliveries.slice(0, 10).map((del) => (
                <div key={del.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 opacity-60">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{del.dropoff_address}</p>
                    <p className="text-[10px] text-muted-foreground">{del.distance_km} km · ₹{Math.round(del.delivery_fee).toLocaleString("en-IN")} · {del.delivered_at ? format(new Date(del.delivered_at), "dd MMM") : ""}</p>
                  </div>
                  <Badge variant="secondary" className={`text-[9px] ${STATUS_COLORS[del.status]}`}>{del.status}</Badge>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Assign Driver Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={(o) => { if (!o) setAssignDialog(null); }}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-base">Assign Driver</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5"><Label className="text-xs">Driver Name</Label><Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Driver name" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Phone Number</Label><Input value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
            <Button onClick={() => assignDriver.mutate()} disabled={!driverName.trim() || assignDriver.isPending} className="w-full" size="sm">
              {assignDriver.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      <Dialog open={!!trackingDialog} onOpenChange={(o) => { if (!o) setTrackingDialog(null); }}>
        <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto p-4">
          {trackingDialog && (
            <DeliveryTrackingMap
              deliveryOrderId={trackingDialog.id}
              pickupLat={trackingDialog.pickup_lat} pickupLng={trackingDialog.pickup_lng} pickupLabel={trackingDialog.pickup_address}
              dropoffLat={trackingDialog.dropoff_lat} dropoffLng={trackingDialog.dropoff_lng} dropoffLabel={trackingDialog.dropoff_address}
              driverLat={trackingDialog.driver_lat} driverLng={trackingDialog.driver_lng}
              status={trackingDialog.status}
              deliveredAt={trackingDialog.delivered_at}
              deliveryPhotoUrl={trackingDialog.delivery_photo_url}
              driverName={trackingDialog.driver_name}
              vehicleType={(trackingDialog.fee_breakdown as any)?.vehicle_type}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManager;
