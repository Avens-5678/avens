import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import Layout from "@/components/Layout/Layout";
import EcommerceHeader from "@/components/ecommerce/EcommerceHeader";
import SiteVisitForm from "@/components/ecommerce/BookingWidget";
import CrewBookingWidget from "@/components/ecommerce/CrewBookingWidget";
import ReviewsList from "@/components/ecommerce/ReviewsList";
import ReviewForm from "@/components/ecommerce/ReviewForm";
import SmartRecommendations from "@/components/ecommerce/SmartRecommendations";
import VenueHoldButton from "@/components/ecommerce/VenueHoldButton";
import BundleSuggestion from "@/components/ecommerce/BundleSuggestion";
import AmenitiesMatrix from "@/components/ecommerce/AmenitiesMatrix";
import HouseRules from "@/components/ecommerce/HouseRules";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAllRentals, useVerifiedVendorInventory } from "@/hooks/useData";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useRentalVariants, RentalVariant } from "@/hooks/useRentalVariants";
import { useAvailability } from "@/hooks/useAvailability";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isMeasurableUnit } from "@/utils/pricingUtils";
import { usePricingRules, applyTieredMarkup } from "@/hooks/usePricingRules";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  ShoppingCart, ArrowLeft, Trash2, ChevronLeft, ChevronRight,
  Star, Share2, Plus, MessageSquare, ZoomIn, Store, BadgeCheck, Eye,
  CalendarIcon, Clock, CheckCircle2, AlertTriangle, Loader2,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const SLOTS = [
  { value: "morning", label: "Morning", time: "8 AM – 2 PM" },
  { value: "evening", label: "Evening", time: "3 PM – 10 PM" },
  { value: "full_day", label: "Full Day", time: "8 AM – 10 PM" },
];

// Recently viewed helper
const RECENT_KEY = "evnting_recently_viewed";
const getRecentlyViewed = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
};
const addToRecentlyViewed = (id: string) => {
  try {
    const existing = getRecentlyViewed();
    const updated = [id, ...existing.filter((x) => x !== id)].slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rentals, isLoading } = useAllRentals();
  const { data: vendorItems, isLoading: vendorLoading } = useVerifiedVendorInventory();
  const { data: variants } = useRentalVariants(id);
  const { addItem, removeItem, isInCart, getItemCount } = useCart();
  const { toast } = useToast();
  const { data: pricingRules } = usePricingRules();
  const { role } = useAuth();
  const isVendorUser = role === "vendor";

  const [selectedVariant, setSelectedVariant] = useState<RentalVariant | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [length, setLength] = useState<number>(0);
  const [breadth, setBreadth] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCat, setSearchCat] = useState("");
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Booking dates state (inline on PDP)
  const [bookingFrom, setBookingFrom] = useState<Date>();
  const [bookingTill, setBookingTill] = useState<Date>();
  const [bookingSlot, setBookingSlot] = useState("full_day");
  const [fromOpen, setFromOpen] = useState(false);
  const [tillOpen, setTillOpen] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  // Merge admin rentals + vendor inventory
  const allItems = useMemo(() => {
    const adminItems = (rentals || []).map((r: any) => ({ ...r, _source: "admin" }));
    const vendorMapped = (vendorItems || []).map((v: any) => ({
      id: v.id,
      title: v.name,
      description: v.description,
      short_description: v.short_description,
      image_url: v.image_url,
      image_urls: v.image_urls,
      categories: v.categories,
      price_value: v.price_value,
      pricing_unit: v.pricing_unit,
      price_range: null,
      address: v.address,
      quantity: v.quantity,
      rating: null,
      is_active: v.is_available,
      show_on_home: true,
      service_type: v.service_type || "rental",
      amenities: v.amenities,
      guest_capacity: v.guest_capacity,
      experience_level: v.experience_level,
      has_variants: v.has_variants,
      specifications: v.specifications || null,
      virtual_tour_url: v.virtual_tour_url || null,
      is_verified: v.is_verified || false,
      created_at: v.created_at,
      vendor_id: v.vendor_id,
      house_rules: v.house_rules || [],
      amenities_matrix: v.amenities_matrix || {},
      venue_pricing_model: v.venue_pricing_model || "dry_rental",
      venue_category: v.venue_category || null,
      site_visit_price: v.site_visit_price ?? 499,
      hold_24hr_price: v.hold_24hr_price ?? 2000,
      packages: v.packages || [],
      markup_tier: v.markup_tier || "mid",
      portfolio_urls: v.portfolio_urls || [],
      video_url: v.video_url || null,
      crew_category: v.crew_category || null,
      outstation_fee: v.outstation_fee ?? 0,
      travel_radius_km: v.travel_radius_km ?? 50,
      specializations: v.specializations || [],
      past_events_count: v.past_events_count ?? 0,
      _source: "vendor",
    }));
    return [...adminItems, ...vendorMapped];
  }, [rentals, vendorItems]);

  const rental = useMemo(() => allItems.find((r: any) => r.id === id), [allItems, id]);
  const vendorId = rental?._source === "vendor" ? rental.vendor_id : undefined;
  const { data: vendorProfile } = useVendorProfile(vendorId);
  const isVenue = (rental?.service_type || "rental") === "venue";
  const isCrew = (rental?.service_type || "rental") === "crew";

  // Availability check
  const checkInStr = bookingFrom ? format(bookingFrom, "yyyy-MM-dd") : undefined;
  const checkOutStr = bookingTill ? format(bookingTill, "yyyy-MM-dd") : undefined;
  const { data: availability, isLoading: availLoading } = useAvailability(
    rental?.id,
    checkInStr,
    checkOutStr,
    bookingSlot
  );
  const isAvailable = availability ? availability.available > 0 : true;
  const isLimited = availability ? availability.available === 1 : false;

  // Track recently viewed
  useEffect(() => { if (id) addToRecentlyViewed(id); }, [id]);

  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariant) setSelectedVariant(variants[0]);
  }, [variants, selectedVariant]);

  // Sticky mobile bottom bar via IntersectionObserver
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rental]);

  const displayImages = useMemo(() => {
    if (selectedVariant) {
      const vi = selectedVariant.image_urls?.length ? selectedVariant.image_urls
        : selectedVariant.image_url ? [selectedVariant.image_url] : null;
      if (vi) return vi;
    }
    if (rental?.image_urls?.length) return rental.image_urls;
    if (rental?.image_url) return [rental.image_url];
    return [];
  }, [rental, selectedVariant]);

  useEffect(() => { setCurrentImageIndex(0); }, [selectedVariant]);

  const tierKey = rental?.markup_tier || "mid";
  const isVendorItem = rental?._source === "vendor";

  const displayPrice = useMemo(() => {
    const rawPrice = selectedVariant?.price_value ?? rental?.price_value ?? null;
    const unit = selectedVariant?.pricing_unit ?? (rental as any)?.pricing_unit ?? "Per Day";

    if (rawPrice != null && isVendorItem && pricingRules?.length) {
      if (isVendorUser) {
        return { value: rawPrice, unit, vendorBase: rawPrice };
      }
      const { clientPrice } = applyTieredMarkup(rawPrice, tierKey, pricingRules);
      return { value: clientPrice, unit, vendorBase: rawPrice };
    }
    if (rawPrice != null) return { value: rawPrice, unit };
    if (rental?.price_range) return { text: `₹${rental.price_range}` };
    return null;
  }, [rental, selectedVariant, pricingRules, tierKey, isVendorItem, isVendorUser]);

  const currentUnit = displayPrice && "unit" in displayPrice ? displayPrice.unit : undefined;
  const isMeasurable = isMeasurableUnit(currentUnit);

  const numDays = bookingFrom && bookingTill ? Math.max(differenceInDays(bookingTill, bookingFrom), 1) : 1;
  const pricePerUnit = displayPrice && "value" in displayPrice ? displayPrice.value : 0;
  const vendorBasePrice = displayPrice && "vendorBase" in displayPrice ? (displayPrice as any).vendorBase : pricePerUnit;
  const totalPrice = pricePerUnit * numDays;

  const variantGroups = useMemo(() => {
    if (!variants?.length) return {};
    const groups: Record<string, RentalVariant[]> = {};
    variants.forEach((v) => { if (!groups[v.attribute_type]) groups[v.attribute_type] = []; groups[v.attribute_type].push(v); });
    return groups;
  }, [variants]);

  const variantId = selectedVariant?.id;
  const inCart = isInCart(id!, variantId);
  const computedArea = isMeasurable ? (length || 0) * (breadth || 0) : quantity;

  const allCategories = useMemo(() => {
    if (!allItems.length) return [];
    const cats = new Set<string>();
    allItems.forEach((r: any) => r.categories?.forEach((c: string) => cats.add(c)));
    return Array.from(cats).sort();
  }, [allItems]);

  const suggestions = useMemo(() => {
    if (!allItems.length || !rental) return [];
    const cats = rental.categories || [];
    const sameCat = allItems.filter((r: any) => r.id !== id && r.is_active !== false && r.categories?.some((c: string) => cats.includes(c)));
    const pool = sameCat.length >= 4 ? sameCat : allItems.filter((r: any) => r.id !== id && r.is_active !== false);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
  }, [allItems, rental, id]);

  const recentlyViewedItems = useMemo(() => {
    if (!allItems.length) return [];
    const ids = getRecentlyViewed().filter((rid) => rid !== id);
    return ids.map((rid) => allItems.find((r: any) => r.id === rid)).filter(Boolean).slice(0, 8);
  }, [allItems, id]);

  const handleAddToCart = () => {
    if (!rental) return;
    if (!bookingFrom || !bookingTill) {
      toast({ title: "Select dates", description: "Please pick Booking From and Booking Till dates.", variant: "destructive" });
      return;
    }
    const finalQuantity = isMeasurable ? computedArea : quantity;
    if (isMeasurable && finalQuantity <= 0) {
      toast({ title: "Enter dimensions", description: "Please enter valid Length and Breadth.", variant: "destructive" });
      return;
    }
    addItem({
      id: rental.id,
      title: rental.title + (selectedVariant ? ` - ${selectedVariant.attribute_value}` : ""),
      price_value: pricePerUnit || null,
      pricing_unit: selectedVariant?.pricing_unit ?? (rental as any).pricing_unit ?? "Per Day",
      price_range: rental.price_range,
      image_url: displayImages[0] || rental.image_url,
      address: rental.address || undefined,
      quantity: finalQuantity,
      variant_id: selectedVariant?.id,
      variant_label: selectedVariant?.attribute_value,
      service_type: (rental as any).service_type || "rental",
      length: isMeasurable ? length : undefined,
      breadth: isMeasurable ? breadth : undefined,
      vendor_id: rental._source === "vendor" ? rental.vendor_id : undefined,
      vendor_pincode: vendorProfile?.warehouse_pincode || undefined,
      booking_from: format(bookingFrom, "yyyy-MM-dd"),
      booking_till: format(bookingTill, "yyyy-MM-dd"),
      booking_slot: isVenue ? bookingSlot : undefined,
      markup_tier: tierKey,
      vendor_base_price: isVendorItem ? vendorBasePrice : undefined,
      volume_units: (rental as any).volume_units || 1,
    });
    navigate("/cart");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: rental?.title, url }); }
    else { await navigator.clipboard.writeText(url); toast({ title: "Link copied!" }); }
  };

  const handleZoomMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }, []);

  if (isLoading || vendorLoading) {
    return <Layout hideNavbar><div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div></Layout>;
  }

  if (!rental) {
    return (
      <Layout hideNavbar>
        <EcommerceHeader searchTerm="" onSearchChange={() => {}} categories={[]} selectedSearchCategory="" onSearchCategoryChange={() => {}} />
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h2>
          <Button onClick={() => navigate("/ecommerce")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Shop</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar>
      <EcommerceHeader
        searchTerm={searchTerm}
        onSearchChange={(v) => { setSearchTerm(v); if (v) navigate(`/ecommerce?search=${encodeURIComponent(v)}`); }}
        categories={allCategories}
        selectedSearchCategory={searchCat}
        onSearchCategoryChange={setSearchCat}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/40 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <button onClick={() => navigate("/ecommerce")} className="hover:text-primary transition-colors">Home</button>
            <span className="text-muted-foreground/50">›</span>
            <button onClick={() => navigate("/ecommerce")} className="hover:text-primary transition-colors">Shop</button>
            {rental.categories?.[0] && (
              <>
                <span className="text-muted-foreground/50">›</span>
                <button onClick={() => navigate(`/ecommerce?category=${rental.categories[0]}`)} className="hover:text-primary transition-colors">{rental.categories[0]}</button>
              </>
            )}
            <span className="text-muted-foreground/50">›</span>
            <span className="text-foreground font-medium line-clamp-1">{rental.title}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-4 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-6 lg:gap-8">

            {/* ── IMAGE GALLERY ── */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 min-w-0">
              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] scrollbar-hide pb-1 sm:pb-0 sm:pr-1">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        i === currentImageIndex ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image with Zoom */}
              <div className="relative flex-1 aspect-square lg:aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border group">
                {displayImages.length > 0 ? (
                  <div
                    className="w-full h-full cursor-crosshair overflow-hidden"
                    onMouseEnter={() => setIsZooming(true)}
                    onMouseLeave={() => setIsZooming(false)}
                    onMouseMove={handleZoomMove}
                  >
                    <img
                      src={displayImages[currentImageIndex]}
                      alt={rental.title}
                      className="w-full h-full object-cover transition-transform duration-200 ease-out"
                      style={{
                        transform: isZooming ? "scale(2)" : "scale(1)",
                        transformOrigin: zoomOrigin,
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}

                {displayImages.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIndex((i) => (i - 1 + displayImages.length) % displayImages.length)} className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm transition-colors z-10">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => setCurrentImageIndex((i) => (i + 1) % displayImages.length)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm transition-colors z-10">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                <div className="absolute top-3 right-3 bg-foreground/60 text-primary-foreground text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <ZoomIn className="h-3 w-3" /> Hover to zoom
                </div>

                {displayImages.length > 1 && (
                  <span className="absolute bottom-3 right-3 sm:hidden bg-foreground/70 text-primary-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {currentImageIndex + 1}/{displayImages.length}
                  </span>
                )}
              </div>
            </div>

            {/* ── PRODUCT INFO ── */}
            <div className="space-y-4 min-w-0">
              {/* Category tags */}
              {rental.categories && rental.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {rental.categories.map((cat: string) => (
                    <Badge key={cat} variant="secondary" className="text-[10px] font-medium">{cat}</Badge>
                  ))}
                </div>
              )}

              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight">{rental.title}</h1>

              {/* Vendor / Sold by */}
              {rental._source === "vendor" && vendorProfile && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/ecommerce?vendor=${rental.vendor_id}`); }}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>Sold by: <span className="font-semibold text-foreground group-hover:text-primary">{vendorProfile.company_name || vendorProfile.full_name}</span></span>
                  {rental.is_verified && (
                    <span className="inline-flex items-center gap-0.5 text-amber-600 text-[10px] font-bold ml-1">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </button>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                {rental.rating && (
                  <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                    {rental.rating} <Star className="h-3 w-3 fill-current" />
                  </span>
                )}
                <div className="flex-1" />
                <button onClick={handleShare} className="p-2 rounded-full hover:bg-muted transition-colors" title="Share">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="h-px bg-border" />

              {/* Price block */}
              {displayPrice && (
                <div className="space-y-1">
                  {isVendorUser && (
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Vendor rate</span>
                  )}
                  <div className="flex items-baseline gap-2">
                    {"value" in displayPrice ? (
                      <>
                        <span className="text-2xl sm:text-3xl font-bold text-foreground">₹{displayPrice.value.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">/ {displayPrice.unit}</span>
                      </>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-bold text-foreground">{displayPrice.text}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-primary font-medium">Inclusive of all taxes</p>
                </div>
              )}

              <div className="h-px bg-border" />

              {/* Variant Selectors */}
              {Object.entries(variantGroups).map(([attrType, attrVariants]) => (
                <div key={attrType} className="space-y-2">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{attrType}</h3>
                  <div className="flex flex-wrap gap-2">
                    {attrVariants.map((v) => {
                      const hasImg = v.image_url || (v.image_urls && v.image_urls.length > 0);
                      const thumbSrc = v.image_urls?.[0] || v.image_url;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                            selectedVariant?.id === v.id
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border bg-background text-foreground hover:border-primary/40"
                          }`}
                        >
                          {hasImg && thumbSrc && (
                            <img src={thumbSrc} alt="" className="w-7 h-7 rounded object-cover" />
                          )}
                          {v.attribute_value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity / Dimensions */}
              <div className="space-y-2">
                {isMeasurable ? (
                  <>
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Dimensions ({currentUnit})</h3>
                    <div className="grid grid-cols-2 gap-3 max-w-[280px]">
                      <div className="space-y-1">
                        <Label htmlFor="pdp-length" className="text-[11px] text-muted-foreground">Length</Label>
                        <Input id="pdp-length" type="number" min={0} step="any" value={length || ""} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} placeholder="e.g. 50" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="pdp-breadth" className="text-[11px] text-muted-foreground">Breadth</Label>
                        <Input id="pdp-breadth" type="number" min={0} step="any" value={breadth || ""} onChange={(e) => setBreadth(parseFloat(e.target.value) || 0)} placeholder="e.g. 30" />
                      </div>
                    </div>
                    {length > 0 && breadth > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Total: <span className="font-semibold text-foreground">{computedArea.toLocaleString()} {currentUnit?.replace("Per ", "")}</span>
                        {displayPrice && "value" in displayPrice && (
                          <> — Est: <span className="font-semibold text-primary">₹{(computedArea * displayPrice.value).toLocaleString()}</span></>
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Quantity</h3>
                    <div className="flex items-center gap-0 border border-border rounded-lg w-fit overflow-hidden">
                      <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-muted transition-colors text-foreground font-medium">−</button>
                      <span className="px-4 py-2 text-center font-semibold text-foreground border-x border-border min-w-[48px]">{quantity}</span>
                      <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 hover:bg-muted transition-colors text-foreground font-medium">+</button>
                    </div>
                  </>
                )}
              </div>

              <div className="h-px bg-border" />

              {/* ── MMT-STYLE BOOKING DATE SELECTOR ── */}
              <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent overflow-hidden">
                {/* Header strip */}
                <div className="bg-primary/10 px-4 py-2.5 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Select Booking Dates</span>
                </div>

                {/* Date selector cards */}
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-0 rounded-lg border border-border overflow-hidden">
                    {/* Booking From */}
                    <Popover open={fromOpen} onOpenChange={setFromOpen}>
                      <PopoverTrigger asChild>
                        <button className={cn(
                          "flex flex-col items-start px-4 py-3 text-left transition-all hover:bg-muted/50 border-r border-border relative",
                          bookingFrom && "bg-primary/[0.03]"
                        )}>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Booking From</span>
                          {bookingFrom ? (
                            <div className="flex items-baseline gap-1.5 mt-1">
                              <span className="text-2xl font-black text-foreground leading-none">{format(bookingFrom, "dd")}</span>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground leading-tight">{format(bookingFrom, "MMM''yy")}</span>
                                <span className="text-[10px] text-muted-foreground leading-tight">{format(bookingFrom, "EEEE")}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="text-sm text-muted-foreground">Select date</span>
                            </div>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={bookingFrom}
                          onSelect={(d) => {
                            setBookingFrom(d);
                            if (d && bookingTill && d >= bookingTill) setBookingTill(undefined);
                            setFromOpen(false);
                            // Auto-open "till" picker after selecting "from"
                            setTimeout(() => setTillOpen(true), 150);
                          }}
                          disabled={(date) => date < today}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Booking Till */}
                    <Popover open={tillOpen} onOpenChange={setTillOpen}>
                      <PopoverTrigger asChild>
                        <button className={cn(
                          "flex flex-col items-start px-4 py-3 text-left transition-all hover:bg-muted/50 relative",
                          bookingTill && "bg-primary/[0.03]"
                        )}>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Booking Till</span>
                          {bookingTill ? (
                            <div className="flex items-baseline gap-1.5 mt-1">
                              <span className="text-2xl font-black text-foreground leading-none">{format(bookingTill, "dd")}</span>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground leading-tight">{format(bookingTill, "MMM''yy")}</span>
                                <span className="text-[10px] text-muted-foreground leading-tight">{format(bookingTill, "EEEE")}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="text-sm text-muted-foreground">Select date</span>
                            </div>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={bookingTill}
                          onSelect={(d) => { setBookingTill(d); setTillOpen(false); }}
                          disabled={(date) => date < (bookingFrom || today)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Duration badge */}
                  {bookingFrom && bookingTill && (
                    <div className="flex items-center justify-center mt-2">
                      <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        {numDays} {numDays === 1 ? "Day" : "Days"}
                      </div>
                    </div>
                  )}

                  {/* Slot selector for venues */}
                  {isVenue && (
                    <div className="mt-3 space-y-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Select Slot</span>
                      <div className="grid grid-cols-3 gap-2">
                        {SLOTS.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => setBookingSlot(s.value)}
                            className={cn(
                              "rounded-lg border px-2 py-2 text-center transition-all",
                              bookingSlot === s.value
                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            )}
                          >
                            <div className="text-xs font-semibold">{s.label}</div>
                            <div className="text-[10px] text-muted-foreground">{s.time}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability status */}
                  {bookingFrom && bookingTill && (
                    <div className="flex items-center gap-2 mt-3">
                      {availLoading ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
                        </span>
                      ) : isAvailable ? (
                        <Badge variant="secondary" className={cn("text-xs gap-1", isLimited ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")}>
                          <CheckCircle2 className="h-3 w-3" />
                          {isLimited ? "Limited Availability" : "Available"}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertTriangle className="h-3 w-3" /> Sold Out
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Price calculation */}
                  {bookingFrom && bookingTill && pricePerUnit > 0 && (
                    <div className="mt-3 bg-muted/60 rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">₹{pricePerUnit.toLocaleString()} × {numDays} {numDays === 1 ? "day" : "days"}</span>
                        <span className="font-semibold text-foreground">₹{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-1 border-t border-border/60">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Row */}
              <div ref={ctaRef} className="flex flex-col gap-3 pt-2">
                {inCart ? (
                  <div className="flex gap-3">
                    <Button onClick={() => navigate("/cart")} size="lg" className="flex-1 text-sm gap-2 h-12">
                      <ShoppingCart className="h-4 w-4" /> View Cart
                    </Button>
                    <Button
                      onClick={() => { removeItem(id!, variantId); toast({ title: "Removed", description: "Item removed from cart." }); }}
                      size="lg" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 h-12 px-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleAddToCart} size="lg" className="w-full text-sm gap-2 h-12" disabled={!isAvailable}>
                    <ShoppingCart className="h-4 w-4" /> {!isAvailable ? "Sold Out" : "Add to Cart"}
                  </Button>
                )}

                {/* Site Visit CTA for venues only */}
                {isVenue && (
                  <SiteVisitForm rental={rental} />
                )}

                {/* Instant 24-Hour Hold for venues */}
                {isVenue && id && (
                  <VenueHoldButton venueId={id} venueName={rental.title || rental.name || "Venue"} holdPrice={rental.hold_24hr_price ?? 2000} />
                )}

                {/* Crew booking CTA */}
                {isCrew && id && (
                  <CrewBookingWidget
                    crewId={id}
                    crewName={rental.title || rental.name || "Crew Member"}
                    packages={rental.packages || []}
                    basePrice={rental.price_value ?? 0}
                  />
                )}

                {/* Smart Bundle suggestion */}
                <BundleSuggestion serviceType={rental.service_type} categories={rental.categories} />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── AMENITIES + HOUSE RULES (Venues only) ── */}
      {(rental.service_type === "venue") && (
        <section className="border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-6 space-y-6">
            <AmenitiesMatrix
              amenitiesMatrix={rental.amenities_matrix || {}}
              amenities={rental.amenities}
            />
            <HouseRules rules={rental.house_rules || []} />

            {rental.venue_pricing_model === "per_plate" && rental.price_value && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-foreground">Estimated Cost Calculator</h3>
                <p className="text-xs text-muted-foreground">
                  Base rate: ₹{rental.price_value.toLocaleString()} / Plate
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">For 100 guests:</span>
                  <span className="font-bold text-primary">~₹{(rental.price_value * 100).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">For 300 guests:</span>
                  <span className="font-bold text-primary">~₹{(rental.price_value * 300).toLocaleString()}</span>
                </div>
              </div>
            )}

            {rental.packages && rental.packages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Available Packages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rental.packages.map((pkg: any, i: number) => (
                    <div key={i} className="border border-border rounded-lg p-4 space-y-1">
                      <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
                      {pkg.description && (
                        <p className="text-xs text-muted-foreground">{pkg.description}</p>
                      )}
                      <p className="text-base font-bold text-primary">
                        ₹{(pkg.base_price || pkg.price || 0).toLocaleString()}
                        {pkg.unit && <span className="text-xs font-normal text-muted-foreground"> / {pkg.unit}</span>}
                      </p>
                      {pkg.deliverables && pkg.deliverables.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-0.5 pt-1">
                          {pkg.deliverables.map((d: string, j: number) => (
                            <li key={j}>✓ {d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CREW SECTIONS ── */}
      {isCrew && (
        <section className="border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-6 space-y-6">

            {/* Specializations */}
            {(rental as any).specializations?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {(rental as any).specializations.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Travel & Outstation */}
            {((rental as any).travel_radius_km > 0 || (rental as any).outstation_fee > 0) && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-foreground">Travel Coverage</h3>
                {(rental as any).travel_radius_km > 0 && (
                  <p className="text-sm text-muted-foreground">
                    ✅ Covers within <span className="font-semibold text-foreground">{(rental as any).travel_radius_km} km</span> at no extra charge.
                  </p>
                )}
                {(rental as any).outstation_fee > 0 && (
                  <p className="text-sm text-muted-foreground">
                    ✈️ Outstation fee: <span className="font-semibold text-foreground">₹{(rental as any).outstation_fee.toLocaleString()}</span>
                  </p>
                )}
              </div>
            )}

            {/* Packages */}
            {rental.packages && rental.packages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Packages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {rental.packages.map((pkg: any, i: number) => (
                    <div key={i} className="border border-border rounded-xl p-4 space-y-2 hover:border-primary/40 transition-colors">
                      <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
                      <p className="text-lg font-bold text-primary">
                        ₹{(pkg.base_price || pkg.price || 0).toLocaleString()}
                        {pkg.unit && <span className="text-xs font-normal text-muted-foreground"> / {pkg.unit}</span>}
                      </p>
                      {(pkg.inclusions || pkg.deliverables) && (
                        <ul className="text-xs text-muted-foreground space-y-1 pt-1">
                          {(pkg.inclusions || pkg.deliverables || []).map((d: string, j: number) => (
                            <li key={j} className="flex items-start gap-1.5">
                              <span className="text-green-500 mt-0.5">✓</span> {d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio gallery */}
            {(rental as any).portfolio_urls?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Portfolio</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(rental as any).portfolio_urls.map((url: string, i: number) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={url}
                        alt={`Portfolio ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Showreel */}
            {(rental as any).video_url && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Showreel</h3>
                <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video">
                  <iframe
                    src={(() => {
                      const url = (rental as any).video_url;
                      if (url.includes("youtube.com/watch")) {
                        const vid = new URL(url).searchParams.get("v");
                        return `https://www.youtube.com/embed/${vid}`;
                      }
                      if (url.includes("youtu.be/")) {
                        const vid = url.split("youtu.be/")[1]?.split("?")[0];
                        return `https://www.youtube.com/embed/${vid}`;
                      }
                      return url;
                    })()}
                    className="w-full h-full"
                    allowFullScreen
                    title="Showreel"
                  />
                </div>
              </div>
            )}

            {/* Past events count */}
            {(rental as any).past_events_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-foreground">{(rental as any).past_events_count}</span>
                events completed
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── BELOW-THE-FOLD TABS ── */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-6">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3 text-sm font-medium">
                Description
              </TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3 text-sm font-medium">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3 text-sm font-medium">
                Reviews
              </TabsTrigger>
              {(rental as any).virtual_tour_url && (
                <TabsTrigger value="virtual-tour" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3 text-sm font-medium flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> 360° Tour
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="description" className="pt-5">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line max-w-3xl">{rental.description}</p>
            </TabsContent>

            <TabsContent value="specifications" className="pt-5">
              <div className="max-w-2xl space-y-2">
                {(rental as any).specifications && Array.isArray((rental as any).specifications) && (rental as any).specifications.length > 0 && (
                  (rental as any).specifications.map((spec: { key: string; value: string }, i: number) => (
                    <div key={i} className={`flex items-start py-2.5 px-3 text-sm ${i % 2 === 0 ? "bg-muted/40" : ""} rounded`}>
                      <span className="w-40 font-medium text-foreground flex-shrink-0">{spec.key}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))
                )}
                {[
                  { label: "Category", value: rental.categories?.join(", ") },
                  { label: "Pricing", value: displayPrice && "value" in displayPrice ? `₹${displayPrice.value.toLocaleString()} ${displayPrice.unit}` : displayPrice?.text },
                  { label: "Rating", value: rental.rating ? `${rental.rating} / 5` : undefined },
                  { label: "Variants", value: variants?.length ? `${variants.length} options available` : undefined },
                ].filter(r => r.value).map(({ label, value }, idx) => {
                  const specCount = ((rental as any).specifications || []).length;
                  const i = idx + specCount;
                  return (
                    <div key={label} className={`flex items-start py-2.5 px-3 text-sm ${i % 2 === 0 ? "bg-muted/40" : ""} rounded`}>
                      <span className="w-40 font-medium text-foreground flex-shrink-0">{label}</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-5 space-y-6">
              <ReviewsList rentalId={id!} />
              <ReviewForm rentalId={id!} rentalTitle={rental.title} />
            </TabsContent>

            {(rental as any).virtual_tour_url && (
              <TabsContent value="virtual-tour" className="pt-5">
                <div className="rounded-xl overflow-hidden border border-border bg-muted">
                  <iframe
                    src={(() => {
                      const url = (rental as any).virtual_tour_url;
                      if (url.includes("youtube.com/watch")) {
                        const vid = new URL(url).searchParams.get("v");
                        return `https://www.youtube.com/embed/${vid}`;
                      }
                      if (url.includes("youtu.be/")) {
                        const vid = url.split("youtu.be/")[1]?.split("?")[0];
                        return `https://www.youtube.com/embed/${vid}`;
                      }
                      return url;
                    })()}
                    className="w-full aspect-video"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                    title="360° Virtual Tour"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Use your mouse or touch to look around in the 360° tour.</p>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </section>

      {/* ── SMART RECOMMENDATIONS ── */}
      <SmartRecommendations currentItem={rental} allItems={allItems} />

      {/* ── YOU MAY ALSO LIKE ── */}
      {suggestions.length > 0 && (
        <section className="py-8 border-t border-border bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-base font-bold text-foreground mb-4">You May Also Like</h2>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {suggestions.map((r: any) => (
                <div key={r.id} className="flex-shrink-0 w-44 sm:w-52 rounded-xl border border-border bg-background overflow-hidden group">
                  <button onClick={() => navigate(`/ecommerce/${r.id}`)} className="w-full text-left">
                    <div className="aspect-square overflow-hidden bg-muted">
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                      )}
                    </div>
                    <div className="p-3 space-y-1.5">
                      <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{r.title}</p>
                      <div className="flex items-center justify-between">
                        {r.price_value != null && (
                          <p className="text-sm font-bold text-foreground">₹{r.price_value.toLocaleString()}</p>
                        )}
                        {r.rating && (
                          <span className="inline-flex items-center gap-0.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {r.rating} <Star className="h-2.5 w-2.5 fill-current" />
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RECENTLY VIEWED ── */}
      {recentlyViewedItems.length > 0 && (
        <section className="py-8 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-base font-bold text-foreground mb-4">Recently Viewed</h2>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {recentlyViewedItems.map((r: any) => (
                <button key={r.id} onClick={() => navigate(`/ecommerce/${r.id}`)} className="flex-shrink-0 w-36 sm:w-44 text-left group">
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted border border-border mb-2">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{r.title}</p>
                  {r.price_value != null && <p className="text-xs font-bold text-foreground mt-0.5">₹{r.price_value.toLocaleString()}</p>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STICKY MOBILE BOTTOM BAR ── */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg px-4 py-3 flex items-center gap-3 lg:hidden">
          <div className="flex-1 min-w-0">
            {displayPrice && "value" in displayPrice ? (
              <p className="text-lg font-bold text-foreground truncate">₹{displayPrice.value.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/ {displayPrice.unit}</span></p>
            ) : displayPrice ? (
              <p className="text-lg font-bold text-foreground truncate">{displayPrice.text}</p>
            ) : null}
          </div>
          {inCart ? (
            <Button onClick={() => navigate("/cart")} size="sm" className="h-10 px-6 text-sm">
              <ShoppingCart className="h-4 w-4 mr-1.5" /> View Cart
            </Button>
          ) : (
            <Button onClick={handleAddToCart} size="sm" className="h-10 px-6 text-sm">
              <ShoppingCart className="h-4 w-4 mr-1.5" /> Add to Cart
            </Button>
          )}
        </div>
      )}

    </Layout>
  );
};


export default ProductDetail;
