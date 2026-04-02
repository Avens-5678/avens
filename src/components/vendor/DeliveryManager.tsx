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
      // Push notification to customer
      const delivery = deliveries.find((d) => d.id === id);
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
    const path = `delivery/${deliveryId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("review-photos").upload(path, file);
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(path);
    await supabase.from("delivery_orders").update({
      delivery_photo_url: urlData.publicUrl, status: "delivered", delivered_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    } as any).eq("id", deliveryId);
    queryClient.invalidateQueries({ queryKey: ["vendor-deliveries"] });
    toast({ title: "Delivery completed with photo proof" });
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

  const activeDeliveries = deliveries.filter((d) => !["delivered", "returned", "cancelled"].includes(d.status));
  const completedDeliveries = deliveries.filter((d) => ["delivered", "returned", "cancelled"].includes(d.status));

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
                    <div className="text-right text-xs">
                      <p className="font-medium">{del.driver_name}</p>
                      {del.driver_phone && <p className="text-muted-foreground">{del.driver_phone}</p>}
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
