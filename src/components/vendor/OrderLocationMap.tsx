import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderLocationMapProps {
  lat: number;
  lng: number;
  address?: string;
}

const OrderLocationMap = ({ lat, lng, address }: OrderLocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !expanded) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = (window as any).L;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
      .setView([lat, lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="background:hsl(var(--primary));width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    L.marker([lat, lng], { icon }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletLoaded, expanded, lat, lng]);

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <MapPin className="h-4 w-4" />
          {expanded ? "Hide Drop Location" : "View Drop Location on Map"}
        </button>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={openGoogleMaps}>
          <Navigation className="h-3 w-3" /> Navigate
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {address && (
        <p className="text-xs text-muted-foreground line-clamp-2 pl-6">{address}</p>
      )}

      {expanded && (
        <div
          ref={mapRef}
          className="h-48 w-full rounded-lg border border-border overflow-hidden"
          style={{ zIndex: 0 }}
        />
      )}
    </div>
  );
};

export default OrderLocationMap;
