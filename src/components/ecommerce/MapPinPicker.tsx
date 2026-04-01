import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MapPinPickerProps {
  label?: string;
  description?: string;
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  compact?: boolean;
}

const MapPinPicker = ({
  label = "Pin your location",
  description,
  initialLat,
  initialLng,
  onLocationSelect,
  compact = false,
}: MapPinPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [lat, setLat] = useState(initialLat || 17.385);
  const [lng, setLng] = useState(initialLng || 78.4867);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet CSS + JS dynamically
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

    return () => {
      // Don't remove — other components might use Leaflet
    };
  }, []);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        { headers: { "User-Agent": "Evnting/1.0" } }
      );
      const data = await res.json();
      const addr = data.display_name || "";
      setAddress(addr);
      return addr;
    } catch {
      return "";
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const map = L.map(mapRef.current).setView([lat, lng], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OSM',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on("dragend", async () => {
      const pos = marker.getLatLng();
      setLat(pos.lat);
      setLng(pos.lng);
      const addr = await reverseGeocode(pos.lat, pos.lng);
      onLocationSelect(pos.lat, pos.lng, addr);
    });

    map.on("click", async (e: any) => {
      marker.setLatLng(e.latlng);
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
      const addr = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      onLocationSelect(e.latlng.lat, e.latlng.lng, addr);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // If initial coords provided, reverse geocode
    if (initialLat && initialLng) {
      reverseGeocode(initialLat, initialLng);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [leafletLoaded]);

  const detectGPS = async () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 15);
          markerRef.current.setLatLng([newLat, newLng]);
        }

        const addr = await reverseGeocode(newLat, newLng);
        onLocationSelect(newLat, newLng, addr);
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 10000 }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=in`,
        { headers: { "User-Agent": "Evnting/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setLat(newLat);
        setLng(newLng);
        setAddress(data[0].display_name || "");

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 15);
          markerRef.current.setLatLng([newLat, newLng]);
        }
        onLocationSelect(newLat, newLng, data[0].display_name);
      }
    } catch {}
    setSearching(false);
  };

  const height = compact ? "h-48" : "h-64";

  return (
    <div className="space-y-3">
      {label && <Label className="text-sm font-semibold">{label}</Label>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {/* Search + GPS */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search address or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchLocation()}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={searchLocation} disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={detectGPS} disabled={detecting}>
          {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        </Button>
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        className={`${height} w-full rounded-lg border border-border overflow-hidden`}
        style={{ zIndex: 0 }}
      />

      {/* Selected address */}
      {address && (
        <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs">
          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <span className="text-muted-foreground line-clamp-2">{address}</span>
        </div>
      )}
    </div>
  );
};

export default MapPinPicker;
