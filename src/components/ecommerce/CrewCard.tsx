import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MapPin, ShieldCheck, CalendarCheck, ArrowRight, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePricingRules, applyTieredMarkup } from "@/hooks/usePricingRules";

const CREW_CATEGORY_LABELS: Record<string, string> = {
  photographer: "Photographer",
  dj: "DJ",
  decorator: "Decorator",
  event_manager: "Event Manager",
  caterer: "Caterer",
  florist: "Florist",
  mc: "MC / Anchor",
  makeup_artist: "Makeup Artist",
  security: "Security",
  waitstaff: "Wait Staff",
  loader: "Loader",
};

interface CrewCardProps {
  crew: any;
  viewMode: "list" | "two" | "one";
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const CrewCard = ({ crew, viewMode }: CrewCardProps) => {
  const navigate = useNavigate();
  const { data: pricingRules } = usePricingRules();

  const isVendor = crew._source === "vendor";
  const isList = viewMode === "list";

  const basePrice = crew.price_value ?? 0;
  let displayPrice = basePrice;
  if (isVendor && pricingRules?.length) {
    const { clientPrice } = applyTieredMarkup(basePrice, crew.markup_tier || "mid", pricingRules);
    displayPrice = clientPrice;
  }

  const categoryLabel =
    crew.crew_category
      ? CREW_CATEGORY_LABELS[crew.crew_category] || crew.crew_category
      : crew.experience_level
      ? crew.experience_level
      : null;

  const specializations: string[] = crew.specializations || crew.categories || [];
  const travelRadius: number = crew.travel_radius_km ?? 50;
  const profileImage = crew.image_url || (crew.image_urls?.[0] ?? null);
  const name = crew.title || crew.name || "Crew Member";

  const handleCardClick = () => navigate(`/ecommerce/${crew.id}`);

  const handleAvailability = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/ecommerce/${crew.id}?action=availability`);
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/ecommerce/${crew.id}`);
  };

  return (
    <Card
      className={`group overflow-hidden border border-border/60 bg-card hover:shadow-medium transition-all duration-300 rounded-xl cursor-pointer ${
        isList ? "flex flex-row items-center" : "flex flex-col"
      }`}
      onClick={handleCardClick}
    >
      {/* Avatar / Profile Image */}
      <div
        className={`relative flex-shrink-0 ${
          isList
            ? "w-20 h-20 m-3 rounded-full overflow-hidden"
            : "mx-auto mt-5 w-24 h-24 rounded-full overflow-hidden"
        }`}
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
            {getInitials(name)}
          </div>
        )}

        {/* Verified ring */}
        {crew.is_verified && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex flex-col flex-1 min-w-0 gap-1.5 ${
          isList ? "p-3" : "px-4 pb-4 pt-3 items-center text-center"
        }`}
      >
        {/* Badges */}
        <div className={`flex gap-1 flex-wrap ${isList ? "" : "justify-center"}`}>
          {crew.is_verified && (
            <Badge className="bg-green-500/90 text-white text-[9px] py-0.5 px-1.5 gap-0.5 border-0">
              <ShieldCheck className="h-2.5 w-2.5" /> Verified
            </Badge>
          )}
          {categoryLabel && (
            <Badge variant="secondary" className="text-[9px] py-0.5 px-1.5 border-0">
              {categoryLabel}
            </Badge>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-1">
          {name}
        </h3>

        {/* Tagline */}
        {crew.short_description && (
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {crew.short_description}
          </p>
        )}

        {/* Location + travel radius */}
        {(crew.address || travelRadius > 0) && (
          <p className={`flex items-center gap-1 text-[11px] text-muted-foreground ${isList ? "" : "justify-center"}`}>
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {crew.address ? `${crew.address}` : ""}
              {crew.address && travelRadius > 0 ? ` · ` : ""}
              {travelRadius > 0 ? `+${travelRadius}km` : ""}
            </span>
          </p>
        )}

        {/* Specialization pills — max 3 */}
        {specializations.length > 0 && (
          <div className={`flex flex-wrap gap-1 ${isList ? "" : "justify-center"}`}>
            {specializations.slice(0, 3).map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="text-[9px] py-0 px-1.5 h-4 border-primary/30 text-primary font-normal"
              >
                {s}
              </Badge>
            ))}
            {specializations.length > 3 && (
              <span className="text-[9px] text-muted-foreground self-center">
                +{specializations.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Rating + past events */}
        <div className={`flex items-center gap-2 ${isList ? "" : "justify-center"}`}>
          {crew.rating != null && Number(crew.rating) > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{Number(crew.rating).toFixed(1)}</span>
            </span>
          )}
          {crew.past_events_count > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Camera className="h-3 w-3" />
              {crew.past_events_count} events
            </span>
          )}
        </div>

        {/* Price */}
        {displayPrice > 0 && (
          <p className="text-sm font-bold text-foreground mt-auto">
            From ₹{displayPrice.toLocaleString()}
            <span className="text-[11px] font-normal text-muted-foreground">
              {" "}/ {crew.pricing_unit || "event"}
            </span>
          </p>
        )}

        {/* CTAs */}
        <div
          className={`flex gap-1.5 pt-0.5 w-full ${isList ? "" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-[11px] font-medium border-primary/40 text-primary hover:bg-primary/5 gap-1"
            onClick={handleAvailability}
          >
            <CalendarCheck className="h-3 w-3" /> Check Availability
          </Button>
          <Button
            size="sm"
            className="h-7 px-3 text-[11px] font-medium gap-1"
            onClick={handleViewProfile}
          >
            Profile <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CrewCard;
