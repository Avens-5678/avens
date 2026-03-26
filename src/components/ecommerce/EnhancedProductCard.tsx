import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";
import { Star, ShieldCheck, Zap, Store, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface EnhancedProductCardProps {
  rental: any;
  viewMode: "list" | "two" | "one";
}

const EnhancedProductCard = ({ rental, viewMode }: EnhancedProductCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { addViewed } = useRecentlyViewed();

  const formatPrice = () => {
    if (rental.price_value != null) {
      return { price: `₹${rental.price_value.toLocaleString()}`, unit: `/ ${rental.pricing_unit || "Per Day"}` };
    }
    if (rental.price_range) return { price: `₹${rental.price_range}`, unit: "" };
    return null;
  };

  const priceInfo = formatPrice();
  const isAssured = rental.rating && rental.rating >= 4;
  const isVendor = rental._source === "vendor";
  const isFeatured = rental.show_on_home;
  const isList = viewMode === "list";

  const handleClick = () => {
    addViewed(rental.id);
    navigate(`/ecommerce/${rental.id}`);
  };

  const specs = rental.specifications
    ? (typeof rental.specifications === "string" ? JSON.parse(rental.specifications) : rental.specifications)
    : null;

  const cardContent = (
    <Card
      className={`group overflow-hidden border border-border/60 bg-card hover:shadow-medium transition-all duration-300 rounded-xl cursor-pointer ${
        isList ? "flex flex-row sm:flex-col" : ""
      }`}
      onClick={handleClick}
    >
      {/* Image */}
      <div
        className={`overflow-hidden bg-muted relative ${
          isList ? "w-28 h-28 flex-shrink-0 sm:w-full sm:h-auto sm:aspect-square" : "aspect-square"
        }`}
      >
        {rental.image_urls && rental.image_urls.length > 0 ? (
          <MultiImageCarousel images={rental.image_urls} title={rental.title} className="!aspect-square !rounded-none" />
        ) : rental.image_url ? (
          <img
            src={rental.image_url}
            alt={rental.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}

        {/* Badges overlay */}
        {!isList && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {isVendor && (
              <Badge className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm gap-1">
                <Store className="h-3 w-3" /> Vendor
              </Badge>
            )}
            {isFeatured && (
              <Badge className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm gap-1">
                <Zap className="h-3 w-3" /> Featured
              </Badge>
            )}
            {rental.categories?.slice(0, 1).map((cat: string) => (
              <Badge key={cat} className="bg-foreground/80 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3 sm:p-4 space-y-1.5 flex-1 min-w-0">
        {/* Assured badge */}
        {isAssured && (
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Evnting Assured</span>
          </div>
        )}

        <h3 className="font-semibold text-foreground text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {rental.title}
        </h3>

        <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">
          {rental.short_description}
        </p>

        {/* Rating */}
        {rental.rating && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              {rental.rating} <Star className="h-2.5 w-2.5 fill-current" />
            </span>
          </div>
        )}

        {/* Price */}
        {priceInfo && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold text-foreground">{priceInfo.price}</span>
            <span className="text-[10px] text-muted-foreground">{priceInfo.unit}</span>
          </div>
        )}

        {/* Location */}
        {rental.address && (
          <p className="text-[10px] text-muted-foreground truncate">
            📍 {rental.address}
          </p>
        )}
      </CardContent>
    </Card>
  );

  // Desktop: wrap with HoverCard for quick preview
  if (isMobile) return cardContent;

  return (
    <HoverCard openDelay={400} closeDelay={100}>
      <HoverCardTrigger asChild>
        {cardContent}
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-72 p-4 space-y-3 z-[60]">
        <h4 className="font-bold text-sm text-foreground leading-snug">{rental.title}</h4>
        
        <p className="text-xs text-muted-foreground line-clamp-4">{rental.description || rental.short_description}</p>

        {/* Specs */}
        {specs && typeof specs === "object" && (
          <div className="space-y-1">
            {Object.entries(specs).slice(0, 3).map(([key, val]) => (
              <div key={key} className="flex justify-between text-[11px]">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-foreground font-medium">{String(val)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Amenities for venues */}
        {rental.amenities && rental.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rental.amenities.slice(0, 4).map((a: string) => (
              <Badge key={a} variant="secondary" className="text-[9px] px-1.5 py-0">
                {a}
              </Badge>
            ))}
          </div>
        )}

        {/* Experience for crew */}
        {rental.experience_level && (
          <p className="text-[11px] text-muted-foreground">
            Experience: <span className="text-foreground font-medium capitalize">{rental.experience_level}</span>
          </p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View Details <ArrowRight className="h-3 w-3" />
        </button>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EnhancedProductCard;
