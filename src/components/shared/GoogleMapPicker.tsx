import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Loader2, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HYDERABAD_CENTER = { lat: 17.385044, lng: 78.486671 };

const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e8f5" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

interface GoogleMapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string, pincode?: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  height?: string;
  placeholder?: string;
  label?: string;
  description?: string;
  compact?: boolean;
}

const GoogleMapPicker = ({
  onLocationSelect,
  initialLat,
  initialLng,
  initialAddress = "",
  height = "280px",
  placeholder = "Search address or landmark",
  label,
  description,
}: GoogleMapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [confirmed, setConfirmed] = useState(!!initialLat && !!initialLng);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const address = results[0].formatted_address;
        const pincode = results[0].address_components?.find(
          (c) => c.types.includes("postal_code")
        )?.long_name;
        setSelectedAddress(address);
        setConfirmed(false);
        onLocationSelect(lat, lng, address, pincode);
      }
    });
  }, [onLocationSelect]);

  useEffect(() => {
    if (!apiKey) {
      console.warn("VITE_GOOGLE_MAPS_API_KEY not set — Google Maps disabled");
      setLoading(false);
      return;
    }

    // Load Google Maps via script tag (Loader class removed in newer versions)
    const loadScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.google?.maps) { resolve(); return; }
        const existing = document.getElementById("google-maps-script");
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", reject);
          return;
        }
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadScript().then(() => {
      if (!mapRef.current || !window.google) return;

      const center = initialLat && initialLng
        ? { lat: initialLat, lng: initialLng }
        : HYDERABAD_CENTER;

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        styles: MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
      });
      mapInstanceRef.current = map;

      const marker = new google.maps.Marker({
        map,
        position: center,
        draggable: true,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#F97316",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          scale: 10,
        },
        animation: google.maps.Animation.DROP,
      });
      markerRef.current = marker;

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) reverseGeocode(pos.lat(), pos.lng());
      });

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        marker.setPosition(e.latLng);
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      });

      // Places autocomplete
      if (inputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "in" },
          fields: ["geometry", "formatted_address", "address_components"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || "";
          const pincode = place.address_components?.find(
            (c) => c.types.includes("postal_code")
          )?.long_name;

          map.setCenter({ lat, lng });
          map.setZoom(16);
          marker.setPosition({ lat, lng });
          marker.setAnimation(google.maps.Animation.DROP);

          setSelectedAddress(address);
          setConfirmed(false);
          onLocationSelect(lat, lng, address, pincode);
        });
      }

      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const detectGPS = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapInstanceRef.current?.setCenter({ lat, lng });
        mapInstanceRef.current?.setZoom(16);
        markerRef.current?.setPosition({ lat, lng });
        markerRef.current?.setAnimation(google.maps.Animation.DROP);
        reverseGeocode(lat, lng);
        setDetecting(false);
      },
      () => { setDetecting(false); },
      { timeout: 10000 }
    );
  };

  // Fallback if no API key — show the old Nominatim search
  if (!apiKey) {
    return (
      <div className="space-y-2">
        {label && <Label className="text-sm font-semibold">{label}</Label>}
        <p className="text-xs text-amber-600">Google Maps API key not configured. Map disabled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && <Label className="text-sm font-semibold">{label}</Label>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {/* Search + GPS */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="w-full h-10 pl-9 pr-3 text-sm border border-input rounded-md bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button variant="outline" size="icon" onClick={detectGPS} disabled={detecting} title="Use my location">
          {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        </Button>
      </div>

      {/* Map */}
      <div className="relative rounded-lg border border-border overflow-hidden" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 z-10 bg-muted/80 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Selected address */}
      {selectedAddress && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
          <span className="text-xs text-muted-foreground flex-1 line-clamp-2">{selectedAddress}</span>
          {!confirmed ? (
            <button
              onClick={() => setConfirmed(true)}
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md flex-shrink-0 transition-colors"
            >
              Confirm
            </button>
          ) : (
            <span className="text-xs text-emerald-600 flex items-center gap-1 flex-shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />Confirmed
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMapPicker;
