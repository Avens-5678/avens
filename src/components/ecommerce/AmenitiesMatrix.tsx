import { Check, X } from "lucide-react";

const AMENITY_ICONS: Record<string, string> = {
  "valet_parking": "🅿️",
  "bridal_rooms": "💍",
  "generator": "⚡",
  "outside_catering": "🍽️",
  "dj_allowed": "🎵",
  "ac": "❄️",
  "swimming_pool": "🏊",
  "garden": "🌳",
  "elevator": "🛗",
  "wifi": "📶",
  "parking": "🚗",
  "rooms": "🛏️",
  "av_equipment": "🎥",
  "terrace": "🏙️",
};

interface AmenitiesMatrixProps {
  amenitiesMatrix: Record<string, boolean | number | string>;
  amenities?: string[];
}

const AmenitiesMatrix = ({ amenitiesMatrix, amenities = [] }: AmenitiesMatrixProps) => {
  // Build combined amenities from both sources
  const allAmenities: { key: string; label: string; value: boolean | number | string }[] = [];

  // From structured matrix
  if (amenitiesMatrix && typeof amenitiesMatrix === "object") {
    Object.entries(amenitiesMatrix).forEach(([key, value]) => {
      const label = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      allAmenities.push({ key, label, value });
    });
  }

  // From array-based amenities (if not already in matrix)
  if (amenities?.length) {
    amenities.forEach((a) => {
      const key = a.toLowerCase().replace(/\s+/g, "_");
      if (!allAmenities.find((am) => am.key === key)) {
        allAmenities.push({ key, label: a, value: true });
      }
    });
  }

  if (allAmenities.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground">Amenities & Facilities</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allAmenities.map(({ key, label, value }) => {
          const icon = AMENITY_ICONS[key] || "✓";
          const isAvailable = typeof value === "boolean" ? value : typeof value === "number" ? value > 0 : !!value;
          const displayValue = typeof value === "number" ? value : typeof value === "string" ? value : null;

          return (
            <div
              key={key}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs ${
                isAvailable
                  ? "border-primary/20 bg-primary/5 text-foreground"
                  : "border-border bg-muted/30 text-muted-foreground line-through"
              }`}
            >
              <span className="text-sm">{icon}</span>
              <span className="flex-1 font-medium">{label}</span>
              {displayValue && typeof displayValue === "number" ? (
                <span className="font-bold text-primary">{displayValue}</span>
              ) : isAvailable ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AmenitiesMatrix;
