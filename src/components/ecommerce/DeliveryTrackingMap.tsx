import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Truck, MapPin, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface DeliveryTrackingMapProps {
  deliveryOrderId: string;
  pickupLat: number;
  pickupLng: number;
  pickupLabel?: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffLabel?: string;
  driverLat?: number | null;
  driverLng?: number | null;
  status: string;
  eta?: string | null;
  deliveredAt?: string | null;
  deliveryPhotoUrl?: string | null;
  driverName?: string | null;
  vehicleType?: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-500" },
  assigned: { label: "Driver Assigned", color: "bg-blue-500" },
  picked_up: { label: "Picked Up", color: "bg-indigo-500" },
  in_transit: { label: "In Transit", color: "bg-primary" },
  delivered: { label: "Delivered", color: "bg-emerald-500" },
  returned: { label: "Returned", color: "bg-gray-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
};

const makeIcon = (L: any, color: string, emoji: string) =>
  L.divIcon({
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.3);font-size:14px">${emoji}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

const DeliveryTrackingMap = ({
  deliveryOrderId,
  pickupLat, pickupLng, pickupLabel,
  dropoffLat, dropoffLng, dropoffLabel,
  driverLat: initialDriverLat, driverLng: initialDriverLng,
  status, eta, deliveredAt, deliveryPhotoUrl,
  driverName, vehicleType,
}: DeliveryTrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(
    initialDriverLat && initialDriverLng ? { lat: initialDriverLat, lng: initialDriverLng } : null
  );

  // Load Leaflet
  useEffect(() => {
    if ((window as any).L) { setLeafletLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }

    const L = (window as any).L;
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);

    // Pickup marker (blue)
    const pickupIcon = makeIcon(L, "#3b82f6", "📦");
    L.marker([pickupLat, pickupLng], { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<b>Pickup</b><br/>${pickupLabel || "Vendor Warehouse"}`);

    // Dropoff marker (green)
    const dropoffIcon = makeIcon(L, "#10b981", "📍");
    L.marker([dropoffLat, dropoffLng], { icon: dropoffIcon })
      .addTo(map)
      .bindPopup(`<b>Delivery</b><br/>${dropoffLabel || "Event Venue"}`);

    // Route line
    const routeLine = L.polyline(
      [[pickupLat, pickupLng], [dropoffLat, dropoffLng]],
      { color: "#6366f1", weight: 3, dashArray: "8 8", opacity: 0.7 }
    ).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds([[pickupLat, pickupLng], [dropoffLat, dropoffLng]]);
    if (driverPos) bounds.extend([driverPos.lat, driverPos.lng]);
    map.fitBounds(bounds.pad(0.15));

    // Driver marker (red, animated)
    if (driverPos && (status === "in_transit" || status === "picked_up")) {
      const driverIcon = makeIcon(L, "#ef4444", "🚛");
      const marker = L.marker([driverPos.lat, driverPos.lng], { icon: driverIcon })
        .addTo(map)
        .bindPopup(`<b>${driverName || "Driver"}</b><br/>${vehicleType || "En route"}`);
      driverMarkerRef.current = marker;
    }

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; driverMarkerRef.current = null; };
  }, [leafletLoaded, pickupLat, pickupLng, dropoffLat, dropoffLng]);

  // Update driver marker position smoothly
  useEffect(() => {
    if (!driverPos || !driverMarkerRef.current) return;
    driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
  }, [driverPos]);

  // Realtime subscription for driver location
  useEffect(() => {
    if (status !== "in_transit" && status !== "picked_up") return;
    const channel = supabase
      .channel(`delivery-track-${deliveryOrderId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "delivery_orders",
        filter: `id=eq.${deliveryOrderId}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row.driver_lat && row.driver_lng) {
          setDriverPos({ lat: row.driver_lat, lng: row.driver_lng });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [deliveryOrderId, status]);

  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.pending;

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.color} ${status === "in_transit" ? "animate-pulse" : ""}`} />
          <span className="text-sm font-semibold text-foreground">{statusInfo.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {driverName && status !== "pending" && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Truck className="h-2.5 w-2.5" />{driverName}
            </Badge>
          )}
          {eta && status === "in_transit" && (
            <Badge className="text-[10px] gap-1 bg-primary">
              <Clock className="h-2.5 w-2.5" />ETA: {eta}
            </Badge>
          )}
          {deliveredAt && status === "delivered" && (
            <Badge className="text-[10px] gap-1 bg-emerald-600">
              <CheckCircle2 className="h-2.5 w-2.5" />Delivered {format(new Date(deliveredAt), "h:mm a")}
            </Badge>
          )}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="w-full h-[300px] sm:h-[400px] rounded-xl border border-border overflow-hidden" style={{ zIndex: 0 }} />

      {/* Status stepper */}
      <div className="flex items-center justify-between px-2">
        {["pending", "picked_up", "in_transit", "delivered"].map((step, i) => {
          const steps = ["pending", "picked_up", "in_transit", "delivered"];
          const currentIdx = steps.indexOf(status);
          const isDone = i <= currentIdx;
          const isCurrent = step === status;
          return (
            <div key={step} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isDone ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"} ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}`}>
                {isDone ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] hidden sm:inline ${isDone ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {step === "pending" ? "Pending" : step === "picked_up" ? "Picked Up" : step === "in_transit" ? "In Transit" : "Delivered"}
              </span>
              {i < 3 && <div className={`w-6 sm:w-10 h-0.5 mx-1 ${i < currentIdx ? "bg-emerald-500" : "bg-muted"}`} />}
            </div>
          );
        })}
      </div>

      {/* Delivery photo */}
      {deliveryPhotoUrl && status === "delivered" && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Delivery Proof</p>
          <a href={deliveryPhotoUrl} target="_blank" rel="noopener noreferrer">
            <img src={deliveryPhotoUrl} alt="Delivery proof" className="w-full max-w-xs h-32 object-cover rounded-lg border border-border" />
          </a>
        </div>
      )}
    </div>
  );
};

export default DeliveryTrackingMap;
