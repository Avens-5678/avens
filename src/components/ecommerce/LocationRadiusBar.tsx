import { useState } from "react";
import { MapPin, Navigation, ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface UserLocation {
  lat: number;
  lng: number;
  pinCode?: string;
  cityName?: string;
}

interface LocationRadiusBarProps {
  location: UserLocation | null;
  radius: number;
  onRadiusChange: (r: number) => void;
  onDetectGPS: () => void;
  onPinCode: (pin: string) => void;
}

const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

const LocationRadiusBar = ({ location, radius, onRadiusChange, onDetectGPS, onPinCode }: LocationRadiusBarProps) => {
  const [pinInput, setPinInput] = useState("");
  const [popOpen, setPopOpen] = useState(false);

  const displayName = location ? (location.cityName || location.pinCode || "Location set") : "Set location";

  return (
    <div className="bg-muted/40 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 sm:gap-4">
        {/* Location display + changer */}
        <Popover open={popOpen} onOpenChange={setPopOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors min-w-0">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground flex-shrink-0">Delivering to:</span>
              <span className="font-semibold text-foreground truncate">{displayName}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3 space-y-3">
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => { onDetectGPS(); setPopOpen(false); }}>
              <Navigation className="h-3 w-3" />Use Current Location
            </Button>
            <div className="flex gap-1.5">
              <Input
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter PIN code"
                className="h-8 text-xs"
                maxLength={6}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pinInput.length === 6) { onPinCode(pinInput); setPopOpen(false); }
                }}
              />
              <Button size="sm" className="h-8 text-xs" disabled={pinInput.length !== 6} onClick={() => { onPinCode(pinInput); setPopOpen(false); }}>Go</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Radius selector — only when location is set */}
        {location && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:inline">Radius:</span>
            <div className="flex gap-1">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => onRadiusChange(r)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${radius === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warning for large radius */}
        {location && radius > 25 && (
          <span className="text-[10px] text-amber-600 flex items-center gap-0.5 hidden sm:flex">
            <AlertTriangle className="h-2.5 w-2.5" />
            {radius > 50 ? "Extended radius — higher delivery fees" : "Higher transport charges possible"}
          </span>
        )}
      </div>
    </div>
  );
};

export default LocationRadiusBar;
