import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";
import { Star, MapPin, Users, ShieldCheck, Building2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePricingRules, applyTieredMarkup } from "@/hooks/usePricingRules";

const CATEGORY_LABELS: Record<string, string> = {
  banquet_hall: "Banquet Hall",
  farmhouse: "Farmhouse",
  rooftop: "Rooftop",
  resort: "Resort",
  convention_centre: "Convention Centre",
  garden: "Garden",
};

const SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  evening: "Evening",
  full_day: "Full Day",
};

interface VenueCardProps {
  venue: any;
  viewMode: "list" | "two" | "one";
}

const VenueCard = ({ venue, viewMode }: VenueCardProps) => {
  const navigate = useNavigate();
  const { data: pricingRules } = usePricingRules();

  const isVendor = venue._source === "vendor";
  const isList = viewMode === "list";

  const basePrice = venue.price_value ?? venue.weekday_price ?? 0;
  let displayPrice = basePrice;
  if (isVendor && pricingRules?.length) {
    const { clientPrice } = applyTieredMarkup(basePrice, venue.markup_tier || "mid", pricingRules);
    displayPrice = clientPrice;
  }

  const siteVisitPrice = venue.site_visit_price ?? 499;
  const holdPrice = venue.hold_24hr_price ?? 2000;

  const handleCardClick = () => navigate(`/ecommerce/${venue.id}`);

  const handleSiteVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/ecommerce/${venue.id}?action=site-visit`);
  };

  const handleHold = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/ecommerce/${venue.id}?action=hold`);
  };

  const slotTypes: string[] = venue.slot_types || [];

  const capacity = venue.max_capacity
    ? `Up to ${venue.max_capacity.toLocaleString()} guests`
    : venue.guest_capacity
    ? venue.guest_capacity
    : null;

  const categoryLabel = venue.venue_category
    ? (CATEGORY_LABELS[venue.venue_category] || venue.venue_category)
    : venue.venue_type || null;

  return (
    <Card
      className={`group overflow-hidden border border-border/60 bg-card hover:shadow-medium transition-all duration-300 rounded-xl cursor-pointer ${
        isList ? "flex flex-row" : "flex flex-col"
      }`}
      onClick={handleCardClick}
    >
      {/* Image section */}
      <div
        className={`overflow-hidden bg-muted relative flex-shrink-0 ${
          isList ? "w-28 min-h-[120px]" : "aspect-[4/3]"
        }`}
      >
        {venue.image_urls?.length > 0 ? (
          <MultiImageCarousel
            images={venue.image_urls}
            title={venue.title}
            className="!rounded-none !aspect-[4/3]"
          />
        ) : venue.image_url ? (
          <img
            src={venue.image_url}
            alt={venue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted min-h-[120px]">
            <Building2 className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {venue.is_verified && (
            <Badge className="bg-green-500/90 text-white text-[9px] py-0.5 px-1.5 gap-0.5 backdrop-blur-sm border-0">
              <ShieldCheck className="h-2.5 w-2.5" /> Verified
            </Badge>
          )}
          {categoryLabel && (
            <Badge
              variant="secondary"
              className="text-[9px] py-0.5 px-1.5 backdrop-blur-sm bg-background/80 border-0"
            >
              {categoryLabel}
            </Badge>
          )}
        </div>

        {/* 360° tour badge */}
        {venue.virtual_tour_url && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary/90 text-primary-foreground text-[9px] py-0.5 px-1.5 gap-0.5 backdrop-blur-sm border-0">
              <Eye className="h-2.5 w-2.5" /> 360°
            </Badge>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="flex flex-col flex-1 p-3 gap-1.5 min-w-0">
        {/* Venue name */}
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-1">
          {venue.title}
        </h3>

        {/* Location */}
        {venue.address && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{venue.address}</span>
          </p>
        )}

        {/* Capacity */}
        {capacity && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="h-3 w-3 flex-shrink-0 text-primary" />
            <span>{capacity}</span>
          </div>
        )}

        {/* Slot availability chips */}
        {slotTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {slotTypes.map((slot) => (
              <Badge
                key={slot}
                variant="outline"
                className="text-[9px] py-0 px-1.5 h-4 border-primary/30 text-primary font-normal"
              >
                {SLOT_LABELS[slot] || slot}
              </Badge>
            ))}
          </div>
        )}

        {/* Rating */}
        {venue.rating != null && Number(venue.rating) > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-foreground">
              {Number(venue.rating).toFixed(1)}
            </span>
          </div>
        )}

        {/* Price */}
        {displayPrice > 0 && (
          <p className="text-sm font-bold text-foreground mt-auto">
            ₹{displayPrice.toLocaleString()}
            <span className="text-[11px] font-normal text-muted-foreground">
              {" "}/ {venue.pricing_unit || "Per Day"}
            </span>
          </p>
        )}

        {/* CTA buttons */}
        <div
          className="flex gap-1.5 pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-[11px] font-medium border-primary/40 text-primary hover:bg-primary/5 truncate"
            onClick={handleSiteVisit}
          >
            Site Visit ₹{siteVisitPrice}
          </Button>
          <Button
            size="sm"
            className="flex-1 h-7 text-[11px] font-medium truncate"
            onClick={handleHold}
          >
            24-hr Hold ₹{holdPrice}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VenueCard;
