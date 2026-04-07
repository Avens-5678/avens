import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";
import { Star, ShieldCheck, Zap, Store, ArrowRight, Eye, BadgeCheck, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { usePricingRules, applyTieredMarkup } from "@/hooks/usePricingRules";
import { useAuth } from "@/hooks/useAuth";
import { MapPin as MapPinIcon } from "lucide-react";

// Inline to avoid importing external module into Ecommerce chunk
const distanceColor = (km: number) =>
  km <= 10 ? "bg-emerald-50 text-emerald-700"
  : km <= 25 ? "bg-amber-50 text-amber-700"
  : "bg-red-50 text-red-700";

const categoryFallbacks: Record<string, string> = {
  "Structures & Venues": "/fallbacks/structures.svg",
  "Stages & Platforms": "/fallbacks/stages.svg",
  "Lighting & Sound": "/fallbacks/lighting.svg",
  "Furniture": "/fallbacks/furniture.svg",
  "default": "/fallbacks/equipment.svg",
};

const getFallbackImage = (categories?: string[]) => {
  if (categories?.length) {
    for (const cat of categories) {
      if (categoryFallbacks[cat]) return categoryFallbacks[cat];
    }
  }
  return categoryFallbacks["default"];
};

const PlaceholderSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-12 h-12 text-gray-300">
    <rect x="10" y="20" width="60" height="45" rx="4" stroke="currentColor" strokeWidth="2" />
    <path d="M10 52l15-12 10 8 20-16 15 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="30" cy="35" r="5" stroke="currentColor" strokeWidth="2" />
    <path d="M25 10h30M40 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface EnhancedProductCardProps {
  rental: any;
  viewMode: "list" | "two" | "one";
}

const VendorLabel = ({ name, vendorId }: { name?: string; vendorId?: string }) => {
  if (!name) return null;
  return (
    <p
      onClick={vendorId ? (e) => { e.stopPropagation(); window.location.href = `/vendor/${vendorId}`; } : undefined}
      className={`text-[10px] text-gray-500 truncate flex items-center gap-1 ${vendorId ? "cursor-pointer hover:text-evn-600 transition-colors" : ""}`}
    >
      <Store className="h-3 w-3" /> Sold by: <span className="font-medium text-gray-700">{name}</span>
    </p>
  );
};

const EnhancedProductCard = ({ rental, viewMode }: EnhancedProductCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { addViewed } = useRecentlyViewed();
  const { data: pricingRules } = usePricingRules();
  const { role } = useAuth();

  const isVendorItem = rental._source === "vendor";
  const isVendorUser = role === "vendor";
  const tierKey = rental.markup_tier || "mid";

  const formatPrice = () => {
    if (rental.price_value != null) {
      let price = rental.price_value;
      if (isVendorItem && pricingRules?.length) {
        const { clientPrice } = applyTieredMarkup(price, tierKey, pricingRules);
        price = isVendorUser ? rental.price_value : clientPrice;
      }
      const prefix = rental.price_from || rental.has_variants ? "From " : "";
      return { price: `${prefix}₹${price.toLocaleString()}`, unit: `/ ${rental.pricing_unit || "Per Day"}` };
    }
    if (rental.price_range) return { price: `₹${rental.price_range}`, unit: "" };
    return null;
  };

  const priceInfo = formatPrice();
  const isAssured = rental.is_verified || rental.is_featured || (rental.rating > 0 && rental.rating >= 4);
  const isFeatured = rental.show_on_home || rental.is_featured;
  const isList = viewMode === "list";
  const hasVirtualTour = !!rental.virtual_tour_url;
  const isVerified = rental.is_verified;

  const handleClick = () => {
    addViewed(rental.id);
    navigate(`/ecommerce/${rental.id}`);
  };

  const specs = rental.specifications
    ? (typeof rental.specifications === "string" ? JSON.parse(rental.specifications) : rental.specifications)
    : null;

  const cardContent = (
    <Card
      className={`group overflow-hidden border border-gray-100 bg-white rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md h-full flex flex-col ${
        isList ? "!flex-row sm:!flex-col" : ""
      }`}
      onClick={handleClick}
    >
      {/* Image */}
      <div
        className={`overflow-hidden bg-gray-100 relative ${
          isList ? "w-28 h-28 flex-shrink-0 sm:w-full sm:h-auto sm:aspect-[4/3]" : "aspect-[4/3]"
        }`}
      >
        {rental.image_urls && rental.image_urls.length > 0 ? (
          <MultiImageCarousel images={rental.image_urls} title={rental.title} className="!aspect-[4/3] !rounded-none" />
        ) : rental.image_url ? (
          <img
            src={rental.image_url}
            alt={rental.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <img
            src={getFallbackImage(rental.categories)}
            alt={rental.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.classList.add("flex", "items-center", "justify-center");
              const svg = document.createElement("div");
              svg.innerHTML = `<svg viewBox="0 0 80 80" fill="none" class="w-12 h-12 text-gray-300"><rect x="10" y="20" width="60" height="45" rx="4" stroke="currentColor" stroke-width="2"/><path d="M10 52l15-12 10 8 20-16 15 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="30" cy="35" r="5" stroke="currentColor" stroke-width="2"/><path d="M25 10h30M40 4v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
              (e.target as HTMLImageElement).parentElement!.appendChild(svg.firstChild!);
            }}
          />
        )}

        {/* Wishlist heart */}
        {!isList && (
          <button
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all duration-200"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Price badge on image */}
        {!isList && priceInfo && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm">
            <span className="text-[12px] font-bold text-gray-900">{priceInfo.price}</span>
            <span className="text-[9px] text-gray-500 ml-0.5">{priceInfo.unit}</span>
          </div>
        )}

        {/* Badges overlay */}
        {!isList && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isVerified && (
              <Badge className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0 rounded gap-0.5 h-4">
                <BadgeCheck className="h-2.5 w-2.5" /> Verified
              </Badge>
            )}
            {hasVirtualTour && (
              <Badge className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0 rounded gap-0.5 h-4">
                <Eye className="h-2.5 w-2.5" /> 360°
              </Badge>
            )}
            {isFeatured && !isVerified && (
              <Badge className="bg-evn-600 text-white text-[9px] font-bold px-1.5 py-0 rounded gap-0.5 h-4">
                <Zap className="h-2.5 w-2.5" /> Featured
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-2 space-y-0.5 flex-1 min-w-0">
        {/* Category + rating inline */}
        <div className="flex items-center gap-1">
          {rental.categories?.slice(0, 1).map((cat: string) => (
            <span key={cat} className="text-[9px] font-medium uppercase text-gray-400 truncate">
              {cat}
            </span>
          ))}
          {rental.rating && rental.rating > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-px text-[9px] font-semibold text-emerald-600">
                {rental.rating} <Star className="h-2 w-2 fill-current" />
              </span>
            </>
          )}
        </div>

        <h3 className="font-medium text-gray-900 text-[12px] leading-tight line-clamp-2 group-hover:text-evn-600 transition-colors">
          {rental.title}
        </h3>

        {/* Distance + location compact */}
        {(rental._distance_km != null || rental.address) && (
          <p className="text-[9px] text-gray-400 truncate flex items-center gap-0.5">
            <MapPinIcon className="h-2.5 w-2.5 flex-shrink-0" />
            {rental._distance_km != null ? `${rental._distance_km} km` : rental.address}
          </p>
        )}

        {/* Price (list mode) */}
        {isList && priceInfo && (
          <div className="flex items-baseline gap-1 pt-0.5">
            <span className="text-[13px] font-bold text-gray-900">{priceInfo.price}</span>
            <span className="text-[9px] text-gray-400">{priceInfo.unit}</span>
          </div>
        )}

        {/* Vendor label */}
        {rental._source === "vendor" && <VendorLabel name={rental.vendor_name || "Marketplace Seller"} vendorId={rental.vendor_id} />}
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
      <HoverCardContent side="right" align="start" className="w-64 p-3 space-y-2 z-[60] rounded-lg shadow-lg border border-gray-100">
        <h4 className="font-bold text-sm text-gray-900 leading-snug">{rental.title}</h4>

        <p className="text-xs text-gray-500 line-clamp-4">{rental.description || rental.short_description}</p>

        {/* Specs */}
        {specs && typeof specs === "object" && (
          <div className="space-y-1.5">
            {Object.entries(specs).slice(0, 3).map(([key, val]) => (
              <div key={key} className="flex justify-between text-[11px]">
                <span className="text-gray-400 capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-gray-700 font-medium">{String(val)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Amenities for venues */}
        {rental.amenities && rental.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rental.amenities.slice(0, 4).map((a: string) => (
              <Badge key={a} variant="secondary" className="text-[9px] px-1.5 py-0 rounded-md bg-gray-100 text-gray-600">
                {a}
              </Badge>
            ))}
          </div>
        )}

        {/* Experience for crew */}
        {rental.experience_level && (
          <p className="text-[11px] text-gray-500">
            Experience: <span className="text-gray-700 font-medium capitalize">{rental.experience_level}</span>
          </p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          className="flex items-center gap-1 text-xs font-semibold text-evn-600 hover:text-evn-700 transition-colors"
        >
          View Details <ArrowRight className="h-3 w-3" />
        </button>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EnhancedProductCard;
