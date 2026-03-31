import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, X, Check, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompareItem {
  id: string;
  title: string;
  image_url?: string;
  price_value?: number;
  pricing_unit?: string;
  rating?: number;
  min_capacity?: number;
  max_capacity?: number;
  amenities?: string[];
  catering_type?: string;
  parking_available?: boolean;
  av_equipment?: boolean;
  virtual_tour_url?: string;
  address?: string;
  venue_type?: string;
}

interface VenueCompareProps {
  items: CompareItem[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

const ALL_AMENITIES = [
  "In-house Catering", "External Catering Allowed", "In-house Decor",
  "AC Halls", "Parking Available", "Valet Parking", "DJ Allowed",
  "Rooms Available", "AV Equipment", "Bridal Suite", "Swimming Pool",
];

const VenueCompare = ({ items, open, onClose, onRemove }: VenueCompareProps) => {
  const navigate = useNavigate();

  if (items.length < 2) return null;

  const rows: { label: string; render: (item: CompareItem) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (item) => item.price_value ? (
        <span className="font-bold text-foreground">₹{item.price_value.toLocaleString()}<span className="text-[10px] text-muted-foreground font-normal"> / {item.pricing_unit || "Per Day"}</span></span>
      ) : <span className="text-muted-foreground text-xs">On request</span>,
    },
    {
      label: "Rating",
      render: (item) => item.rating ? (
        <span className="inline-flex items-center gap-0.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
          {item.rating} <Star className="h-2.5 w-2.5 fill-current" />
        </span>
      ) : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      label: "Capacity",
      render: (item) => (item.min_capacity || item.max_capacity) ? (
        <span className="text-xs">{item.min_capacity || "?"} – {item.max_capacity || "?"} guests</span>
      ) : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      label: "Venue Type",
      render: (item) => item.venue_type ? <Badge variant="secondary" className="text-[10px]">{item.venue_type}</Badge> : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      label: "Catering",
      render: (item) => item.catering_type ? <span className="text-xs capitalize">{item.catering_type}</span> : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      label: "Virtual Tour",
      render: (item) => item.virtual_tour_url ? <Check className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Location",
      render: (item) => item.address ? <span className="text-xs truncate max-w-[120px] block">{item.address}</span> : <span className="text-muted-foreground text-xs">—</span>,
    },
  ];

  // Add amenity rows
  ALL_AMENITIES.forEach((amenity) => {
    const anyHas = items.some((item) => item.amenities?.includes(amenity));
    if (anyHas) {
      rows.push({
        label: amenity,
        render: (item) => item.amenities?.includes(amenity)
          ? <Check className="h-4 w-4 text-primary" />
          : <Minus className="h-4 w-4 text-muted-foreground" />,
      });
    }
  });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Compare Venues ({items.length})</SheetTitle>
        </SheetHeader>

        <div className="overflow-x-auto mt-4">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground p-2 w-32"></th>
                {items.map((item) => (
                  <th key={item.id} className="p-2 text-center min-w-[140px]">
                    <div className="space-y-2">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.title} className="w-20 h-20 object-cover rounded-lg mx-auto" />
                      )}
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{item.title}</p>
                      <div className="flex gap-1 justify-center">
                        <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => { onClose(); navigate(`/ecommerce/${item.id}`); }}>
                          View
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onRemove(item.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                  <td className="text-xs font-medium text-muted-foreground p-2">{row.label}</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-2 text-center">{row.render(item)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VenueCompare;
