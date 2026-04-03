import { useState, useMemo, useEffect, useRef, lazy, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout/Layout";
import { useAllRentals, useVerifiedVendorInventory } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, X, List, Grid2X2, Square, ShoppingCart, MapPin, Users, Building2, Wrench, Store, ArrowLeft, GitCompareArrows, Search, Calendar, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import VenueSearchBar from "@/components/ecommerce/VenueSearchBar";
import CrewSubTabs from "@/components/ecommerce/CrewSubTabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import EcommerceHeader from "@/components/ecommerce/EcommerceHeader";
import TrustStrip from "@/components/ecommerce/TrustStrip";
import EcommerceBreadcrumbs from "@/components/ecommerce/EcommerceBreadcrumbs";
import EnhancedProductCard from "@/components/ecommerce/EnhancedProductCard";
import ServiceSelector from "@/components/ecommerce/ServiceSelector";
import CategoryIconStrip from "@/components/ecommerce/CategoryIconStrip";
import LocationPrompt from "@/components/ecommerce/LocationPrompt";
import LocationRadiusBar from "@/components/ecommerce/LocationRadiusBar";
import DiscoveryRow from "@/components/ecommerce/DiscoveryRow";
import MobileBottomNav from "@/components/ecommerce/MobileBottomNav";
import HowItWorks from "@/components/ecommerce/HowItWorks";
import EventPackages from "@/components/ecommerce/EventPackages";
import VenueCard from "@/components/ecommerce/VenueCard";
import CrewCard from "@/components/ecommerce/CrewCard";
import { useUserLocation } from "@/hooks/useUserLocation";
import { cn } from "@/lib/utils";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

// IMPORTANT: Do NOT put React.lazy() at module level — Vite's __vite_preload
// is a const defined later in the chunk, causing TDZ "Cannot access '_' before init"
// These are created inside the component via useLazyComponents() below.
function useLazyComponents() {
  const ref = useRef<{
    PromoBannerCarousel: React.LazyExoticComponent<any>;
    LookbookSection: React.LazyExoticComponent<any>;
    VenueCompare: React.LazyExoticComponent<any>;
  } | null>(null);
  if (!ref.current) {
    ref.current = {
      PromoBannerCarousel: lazy(() => import("@/components/ecommerce/PromoBannerCarousel")),
      LookbookSection: lazy(() => import("@/components/ecommerce/LookbookSection")),
      VenueCompare: lazy(() => import("@/components/ecommerce/VenueCompare")),
    };
  }
  return ref.current;
}

// Inline Haversine to avoid importing supabase into this chunk
function _haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*10)/10;
}
type SortOption = "relevance" | "price_low" | "price_high" | "newest" | "rating";

// ── Rental-specific filters ──
const RENTAL_PRICE_RANGES = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹15,000", min: 5000, max: 15000 },
  { label: "₹15,000 – ₹50,000", min: 15000, max: 50000 },
  { label: "₹50,000+", min: 50000, max: Infinity },
];

// ── Venue-specific filters ──
const VENUE_PRICE_RANGES = [
  { label: "Under ₹25,000", min: 0, max: 25000 },
  { label: "₹25,000 – ₹75,000", min: 25000, max: 75000 },
  { label: "₹75,000 – ₹2,00,000", min: 75000, max: 200000 },
  { label: "₹2,00,000+", min: 200000, max: Infinity },
];

const VENUE_CAPACITY_OPTIONS = [
  { label: "Up to 100 guests", value: "small" },
  { label: "100 – 300 guests", value: "medium" },
  { label: "300 – 500 guests", value: "large" },
  { label: "500+ guests", value: "mega" },
];

const VENUE_AMENITY_OPTIONS = [
  "In-house Catering",
  "Without Catering",
  "In-house Decor",
  "AC Halls",
  "Parking Available",
  "DJ Allowed",
  "Valet Parking",
];

// ── Crew-specific filters ──
const CREW_PRICE_RANGES = [
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 – ₹25,000", min: 10000, max: 25000 },
  { label: "₹25,000 – ₹50,000", min: 25000, max: 50000 },
  { label: "₹50,000+", min: 50000, max: Infinity },
];

const CREW_EXPERIENCE_OPTIONS = [
  { label: "1–3 Years", value: "junior" },
  { label: "3–5 Years", value: "mid" },
  { label: "5–10 Years", value: "senior" },
  { label: "10+ Years", value: "expert" },
];

// ── Discovery section with Top Picks + Recently Viewed ──
const DiscoverySection = ({ allItems, userLocation, discoveryBestRentals, discoveryBestInCity, discoveryBestCrew, discoveryTopVenues, featuredItems }: any) => {
  const { recentIds, clearViewed } = useRecentlyViewed();

  const recentlyViewedItems = useMemo(() => {
    if (recentIds.length === 0) return [];
    return recentIds.map((id: string) => allItems.find((r: any) => r.id === id)).filter(Boolean);
  }, [recentIds, allItems]);

  const topPicksForYou = useMemo(() => {
    if (recentIds.length === 0) return [];
    const viewedItems = recentIds.map((id: string) => allItems.find((r: any) => r.id === id)).filter(Boolean);
    const viewedCategories = new Set<string>();
    viewedItems.forEach((item: any) => item.categories?.forEach((c: string) => viewedCategories.add(c)));
    if (viewedCategories.size === 0) return [];
    return allItems
      .filter((r: any) => !recentIds.includes(r.id) && r.categories?.some((c: string) => viewedCategories.has(c)))
      .slice(0, 12);
  }, [allItems, recentIds]);

  return (
    <div className="bg-background py-4 sm:py-6">
      {featuredItems.length > 0 && (
        <DiscoveryRow title={<span className="inline-flex items-center gap-2"><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-amber-500"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>Featured Products</span>} subtitle="Hand-picked by our team" items={featuredItems} />
      )}
      <DiscoveryRow title={<span className="inline-flex items-center gap-2"><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-orange-500"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/></svg>Discover Best Rentals</span>} subtitle="Top-rated equipment for your events" items={discoveryBestRentals} />
      {discoveryBestInCity.length > 0 && (
        <DiscoveryRow title={<span className="inline-flex items-center gap-2"><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-rose-500"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>{`Discover Best in ${userLocation?.cityName || "Your City"}`}</span>} subtitle="Popular items near you" items={discoveryBestInCity} />
      )}
      {topPicksForYou.length > 0 && (
        <DiscoveryRow title={<span className="inline-flex items-center gap-2"><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-purple-500"><path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.967.744L14.146 7.2 17.5 7.512a1 1 0 01.541 1.751l-2.547 2.169.783 3.294a1 1 0 01-1.494 1.083L12 14.028l-2.783 1.781a1 1 0 01-1.494-1.083l.783-3.294-2.547-2.169a1 1 0 01.541-1.751L9.854 7.2l1.179-4.456A1 1 0 0112 2z"/></svg>Top Picks for You</span>} subtitle="Based on your browsing history" items={topPicksForYou} />
      )}
      {discoveryBestCrew.length > 0 && (
        <DiscoveryRow title={<span className="inline-flex items-center gap-2"><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-sky-500"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>Best Crew for Your Event</span>} subtitle="Skilled professionals ready to help" items={discoveryBestCrew} />
      )}
      {discoveryTopVenues.length > 0 && (
        <DiscoveryRow title={<span className="inline-flex items-center gap-2"><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-amber-600"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/></svg>Top Venues Near You</span>} subtitle="Perfect spaces for every occasion" items={discoveryTopVenues} />
      )}
      {recentlyViewedItems.length > 0 && (
        <DiscoveryRow title={<span className="inline-flex items-center gap-2"><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-500"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>Recently Viewed <span className="text-muted-foreground font-normal text-sm">({recentlyViewedItems.length})</span></span>} subtitle="Pick up where you left off" items={recentlyViewedItems} onClear={clearViewed} />
      )}
    </div>
  );
};

const Ecommerce = () => {
  const { PromoBannerCarousel, LookbookSection, VenueCompare } = useLazyComponents();
  const { data: rentals, isLoading } = useAllRentals();
  const { data: vendorItems } = useVerifiedVendorInventory();
  const [searchParams, setSearchParams] = useSearchParams();
  const vendorFilterId = searchParams.get("vendor") || "";

  // Capture referral code from URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) { localStorage.setItem("evnting_referral_code", ref); searchParams.delete("ref"); setSearchParams(searchParams, { replace: true }); }
  }, []);

  // Fetch vendor profile for vendor store header
  const { data: vendorStoreProfile } = useVendorProfile(vendorFilterId || undefined);

  // Featured items — skip dynamic fetch to avoid supabase in this chunk
  const featuredItemIds: string[] = [];

  const { location: userLocation, showPrompt, detectGPS, setFromPinCode, clearLocation, dismissPrompt } = useUserLocation();

  // Merge vendor items into rentals format
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
      created_at: v.created_at,
      search_keywords: v.search_keywords,
      slot_types: v.slot_types,
      vendor_id: v.vendor_id,
      virtual_tour_url: v.virtual_tour_url || null,
      is_verified: v.is_verified || false,
      markup_tier: v.markup_tier || "mid",
      venue_type: v.venue_type || null,
      venue_category: v.venue_category || null,
      site_visit_price: v.site_visit_price ?? 499,
      hold_24hr_price: v.hold_24hr_price ?? 2000,
      min_capacity: v.min_capacity,
      max_capacity: v.max_capacity,
      catering_type: v.catering_type,
      parking_available: v.parking_available,
      av_equipment: v.av_equipment,
      crew_type: v.crew_type || null,
      crew_category: v.crew_category || null,
      outstation_fee: v.outstation_fee ?? 0,
      travel_radius_km: v.travel_radius_km ?? 50,
      specializations: v.specializations || [],
      past_events_count: v.past_events_count ?? 0,
      venue_pricing_model: v.venue_pricing_model || "dry_rental",
      house_rules: v.house_rules || [],
      amenities_matrix: v.amenities_matrix || {},
      packages: v.packages || [],
      portfolio_urls: v.portfolio_urls || [],
      instagram_url: v.instagram_url || null,
      pickup_lat: v.pickup_lat || null,
      pickup_lng: v.pickup_lng || null,
      _source: "vendor",
    }));
    return [...adminItems, ...vendorMapped];
  }, [rentals, vendorItems]);
  // Enrich items with distance (inline calc, no external supabase import)
  const itemsWithDistance = useMemo(() => {
    if (!userLocation) return allItems.map((r: any) => ({ ...r, _distance_km: null }));
    return allItems.map((r: any) => {
      const lat = r.pickup_lat || r.warehouse_lat;
      const lng = r.pickup_lng || r.warehouse_lng;
      const dist = lat && lng ? _haversine(userLocation.lat, userLocation.lng, lat, lng) : null;
      return { ...r, _distance_km: dist };
    });
  }, [allItems, userLocation]);

  const { items } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [availabilityDate, setAvailabilityDate] = useState<Date | null>(null);
  const [unavailableIds, setUnavailableIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [showInStock, setShowInStock] = useState(false);
  const [searchCategory, setSearchCategory] = useState(() => searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    city: true,
    price: false,
    availability: false,
    amenities: false,
    capacity: false,
    experience: false,
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "two" | "one">("two");
  const [activeQuickCat, setActiveQuickCat] = useState("");
  const [activeService, setActiveService] = useState("");
  const [promoFilterIds, setPromoFilterIds] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedCapacity, setSelectedCapacity] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [crewSubTab, setCrewSubTab] = useState<"commodity" | "creative">("commodity");
  const [venueSearchFilters, setVenueSearchFilters] = useState<{
    date?: string; slot?: string; eventType?: string; guestCount?: number;
  }>({});
  
  const [deliveryRadius, setDeliveryRadius] = useState(() => {
    try { return parseInt(localStorage.getItem("evnting_delivery_radius") || "15") || 15; } catch { return 15; }
  });
  const handleRadiusChange = (r: number) => { setDeliveryRadius(r); localStorage.setItem("evnting_delivery_radius", String(r)); };

  // Map activeService card IDs to service_type DB values
  const serviceTypeMap: Record<string, string> = {
    "insta-rent": "rental",
    "venues": "venue",
    "crew-hub": "crew",
  };
  const activeServiceType = activeService ? serviceTypeMap[activeService] || "" : "";

  // Get price ranges based on active service
  const activePriceRanges = activeServiceType === "venue" ? VENUE_PRICE_RANGES : activeServiceType === "crew" ? CREW_PRICE_RANGES : RENTAL_PRICE_RANGES;

  const categories = useMemo(() => {
    if (!allItems.length) return [];
    const cats = new Set<string>();
    const itemsForCats = activeServiceType
      ? allItems.filter((r: any) => (r.service_type || "rental") === activeServiceType)
      : allItems;
    itemsForCats.forEach((r: any) => r.categories?.forEach((c: string) => cats.add(c)));
    return Array.from(cats).sort();
  }, [allItems, activeServiceType]);

  const quickBrowseCategories = useMemo(() => {
    return [{ label: "All", value: "" }, ...categories.map(c => ({ label: c, value: c }))];
  }, [categories]);

  const cities = useMemo(() => {
    if (!allItems.length) return [];
    const citySet = new Set<string>();
    const itemsForCities = activeServiceType
      ? allItems.filter((r: any) => (r.service_type || "rental") === activeServiceType)
      : allItems;
    itemsForCities.forEach((r: any) => {
      if (r.address?.trim()) citySet.add(r.address.trim());
    });
    return Array.from(citySet).sort();
  }, [allItems, activeServiceType]);

  useEffect(() => {
    const nextSearch = searchParams.get("search") || "";
    const nextCategory = searchParams.get("category") || "";

    setSearchTerm((prev) => (prev === nextSearch ? prev : nextSearch));
    setSearchCategory((prev) => (prev === nextCategory ? prev : nextCategory));
  }, [searchParams]);

  // Reset service-specific filters when service changes
  useEffect(() => {
    setSelectedAmenities([]);
    setSelectedCapacity([]);
    setSelectedExperience([]);
    setSelectedPriceRanges([]);
    setSelectedCategories([]);
    setSelectedCities([]);
    setShowInStock(false);
  }, [activeService]);

  // Debounce search term — 300ms delay for grid filtering
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch unavailable item IDs when availability date changes
  useEffect(() => {
    if (!availabilityDate) { setUnavailableIds([]); return; }
    const dateStr = availabilityDate.toISOString().split("T")[0];
    (async () => {
      const { data } = await supabase
        .from("rental_orders")
        .select("vendor_inventory_item_id")
        .lte("check_in", dateStr)
        .gte("check_out", dateStr)
        .in("status", ["confirmed", "active", "pending"]);
      setUnavailableIds((data || []).map((d: any) => d.vendor_inventory_item_id).filter(Boolean));
    })();
  }, [availabilityDate]);

  const filteredRentals = useMemo(() => {
    if (!allItems.length) return [];

    // Vendor store filter
    if (vendorFilterId) {
      let results = allItems.filter((r: any) => r._source === "vendor" && r.vendor_id === vendorFilterId);
      if (debouncedSearch) {
        results = results.filter((r: any) => r.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
      }
      return results;
    }

    if (promoFilterIds.length > 0) {
      let results = allItems.filter((r: any) => promoFilterIds.includes(r.id));
      if (debouncedSearch) {
        results = results.filter((r: any) =>
          r.title.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }
      return results;
    }

    let results = itemsWithDistance.filter((rental: any) => {
      const normalizedSearch = debouncedSearch.trim().toLowerCase();
      const searchableText = [
        rental.title,
        rental.short_description,
        rental.description,
        rental.service_type,
        rental.address,
        rental.search_keywords,
        rental.venue_type,
        rental.crew_type,
        ...(rental.categories || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const allCats = [...selectedCategories];
      if (activeQuickCat && !allCats.includes(activeQuickCat)) allCats.push(activeQuickCat);
      if (searchCategory && !allCats.includes(searchCategory)) allCats.push(searchCategory);
      const matchesCategory =
        allCats.length === 0 || rental.categories?.some((c: string) =>
          allCats.some((selected: string) => c.toLowerCase() === selected.toLowerCase())
        );
      const matchesCity =
        selectedCities.length === 0 ||
        (rental.address?.trim() && selectedCities.includes(rental.address.trim()));

      const matchesPrice =
        selectedPriceRanges.length === 0 ||
        selectedPriceRanges.some((idx: number) => {
          const range = activePriceRanges[idx];
          const price = rental.price_value ?? 0;
          return price >= range.min && price < range.max;
        });

      const matchesAvailability = !showInStock || (rental.quantity != null && rental.quantity > 0);

      const matchesService =
        !activeServiceType ||
        (rental.service_type || "rental") === activeServiceType;

      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((a: string) => (rental.amenities || []).includes(a));

      const matchesCapacity =
        selectedCapacity.length === 0 ||
        selectedCapacity.includes(rental.guest_capacity || "");

      const matchesExperience =
        selectedExperience.length === 0 ||
        selectedExperience.includes(rental.experience_level || "");

      // Crew sub-tab filter
      const matchesCrewType = activeServiceType !== "crew" || !rental.crew_type ||
        (crewSubTab === "commodity" ? rental.crew_type === "commodity" : rental.crew_type === "creative");

      // Venue search bar: guest count filter
      const matchesVenueGuestCount = !venueSearchFilters.guestCount || activeServiceType !== "venue" ||
        (rental.min_capacity && rental.max_capacity &&
          venueSearchFilters.guestCount >= rental.min_capacity &&
          venueSearchFilters.guestCount <= rental.max_capacity) ||
        (!rental.min_capacity && !rental.max_capacity);

      const venueFilterText = [
        rental.title,
        rental.short_description,
        rental.description,
        rental.venue_type,
        ...(rental.categories || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesVenueEventType =
        !venueSearchFilters.eventType ||
        activeServiceType !== "venue" ||
        venueSearchFilters.eventType === "all" ||
        venueFilterText.includes(venueSearchFilters.eventType.toLowerCase());

      const matchesVenueSlot =
        !venueSearchFilters.slot ||
        activeServiceType !== "venue" ||
        !Array.isArray(rental.slot_types) ||
        rental.slot_types.length === 0 ||
        rental.slot_types.includes(venueSearchFilters.slot) ||
        rental.slot_types.includes("full_day");

      // Radius filter: include if within radius OR no distance data (don't exclude unknowns)
      const matchesRadius = !userLocation || rental._distance_km === null || rental._distance_km <= deliveryRadius;

      return matchesSearch && matchesCategory && matchesCity && matchesService && matchesPrice && matchesAvailability && matchesAmenities && matchesCapacity && matchesExperience && matchesCrewType && matchesVenueGuestCount && matchesVenueEventType && matchesVenueSlot && matchesRadius;
    });

    switch (sortBy) {
      case "price_low":
        results.sort((a: any, b: any) => (a.price_value ?? Infinity) - (b.price_value ?? Infinity));
        break;
      case "price_high":
        results.sort((a: any, b: any) => (b.price_value ?? 0) - (a.price_value ?? 0));
        break;
      case "newest":
        results.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rating":
        results.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }

    // Mark unavailable items and sort available-first when date filter is active
    if (unavailableIds.length > 0) {
      results = results.map((r: any) => ({ ...r, _isUnavailable: unavailableIds.includes(r.id) }));
      results.sort((a: any, b: any) => {
        if (a._isUnavailable && !b._isUnavailable) return 1;
        if (!a._isUnavailable && b._isUnavailable) return -1;
        return 0;
      });
    }

    return results;
  }, [allItems, itemsWithDistance, debouncedSearch, selectedCategories, selectedCities, activeQuickCat, searchCategory, sortBy, promoFilterIds, activeServiceType, selectedPriceRanges, showInStock, activePriceRanges, selectedAmenities, selectedCapacity, selectedExperience, vendorFilterId, crewSubTab, venueSearchFilters, deliveryRadius, userLocation, unavailableIds]);

  // Discovery rows for default landing view
  const isDiscoveryView = !activeService && !debouncedSearch && !activeQuickCat && !searchCategory && selectedCategories.length === 0 && promoFilterIds.length === 0 && !vendorFilterId;

  const discoveryBestRentals = useMemo(() => {
    return allItems
      .filter((r: any) => (r.service_type || "rental") === "rental" && r.is_active !== false)
      .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12);
  }, [allItems]);

  const discoveryBestInCity = useMemo(() => {
    if (!userLocation?.cityName) return [];
    const city = userLocation.cityName.toLowerCase();
    return allItems
      .filter((r: any) => r.address?.toLowerCase().includes(city))
      .slice(0, 12);
  }, [allItems, userLocation]);

  const discoveryBestCrew = useMemo(() => {
    return allItems
      .filter((r: any) => (r.service_type || "rental") === "crew" && r.is_active !== false)
      .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12);
  }, [allItems]);

  const discoveryTopVenues = useMemo(() => {
    return allItems
      .filter((r: any) => (r.service_type || "rental") === "venue" && r.is_active !== false)
      .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12);
  }, [allItems]);

  const featuredProducts = useMemo(() => {
    if (featuredItemIds.length === 0) return [];
    return featuredItemIds
      .map((fid: string) => allItems.find((r: any) => r.id === fid))
      .filter(Boolean);
  }, [allItems, featuredItemIds]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const togglePriceRange = (idx: number) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleCapacity = (cap: string) => {
    setSelectedCapacity((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const toggleExperience = (exp: string) => {
    setSelectedExperience((prev) =>
      prev.includes(exp) ? prev.filter((e) => e !== exp) : [...prev, exp]
    );
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const compareItems = useMemo(() => {
    return compareIds.map((cid) => allItems.find((r: any) => r.id === cid)).filter(Boolean);
  }, [compareIds, allItems]);

  const activeFilterCount = selectedCategories.length + selectedCities.length + selectedPriceRanges.length + (showInStock ? 1 : 0) + selectedAmenities.length + selectedCapacity.length + selectedExperience.length + (availabilityDate ? 1 : 0);
  const activeDisplayCategory = activeQuickCat || searchCategory || (selectedCategories.length === 1 ? selectedCategories[0] : "");

  const SkeletonCard = () => (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-2.5 bg-muted rounded w-full" />
        <div className="h-2.5 bg-muted rounded w-1/2" />
        <div className="h-5 bg-muted rounded w-1/3 mt-2" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Layout hideNavbar>
        <EcommerceHeader searchTerm="" onSearchChange={() => {}} categories={[]} selectedSearchCategory="" onSearchCategoryChange={() => {}} />
        <section className="py-6 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-4">
            <div className="max-w-7xl mx-auto flex gap-5">
              <aside className="hidden lg:block w-56 flex-shrink-0">
                <div className="bg-card rounded-xl border border-border/60 p-4 space-y-4 animate-pulse">
                  {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-muted rounded w-full" />)}
                </div>
              </aside>
              <div className="flex-1">
                <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedCities([]);
    setSelectedPriceRanges([]);
    setShowInStock(false);
    setSelectedAmenities([]);
    setSelectedCapacity([]);
    setSelectedExperience([]);
    setAvailabilityDate(null);
  };

  // ── Filter section helper ──
  const FilterSection = ({ title, sectionKey, children }: { title: string; sectionKey: string; children: React.ReactNode }) => (
    <>
      <div className="py-3">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-1"
        >
          <span>{title}</span>
          {expandedSections[sectionKey] ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections[sectionKey] && (
          <div className="space-y-2 pt-2 pl-1 max-h-48 overflow-y-auto">
            {children}
          </div>
        )}
      </div>
      <Separator />
    </>
  );

  const CheckboxItem = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5"
      />
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </label>
  );

  // ── Service-specific sidebar ──
  const SidebarFilters = () => {
    const serviceLabel = activeServiceType === "venue" ? "Venues" : activeServiceType === "crew" ? "Crew" : "Rentals";
    const ServiceIcon = activeServiceType === "venue" ? Building2 : activeServiceType === "crew" ? Users : Wrench;

    return (
      <div className="space-y-1">
        {/* Location indicator */}
        <div className="pb-3">
          <button
            onClick={() => clearLocation()}
            className="flex items-center gap-2 w-full text-left group"
          >
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground truncate">
              {userLocation ? (
                <>{userLocation.cityName || userLocation.pinCode || "Location set"}</>
              ) : (
                <span className="text-muted-foreground">Set your location</span>
              )}
            </span>
            {userLocation && (
              <span className="text-[10px] text-muted-foreground group-hover:text-destructive ml-auto">Change</span>
            )}
          </button>
        </div>
        <Separator />

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <ServiceIcon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{serviceLabel} Filters</h3>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <Separator />

        {/* Category — common to all */}
        <FilterSection title="Category" sectionKey="categories">
          {categories.map((category) => (
            <CheckboxItem key={category} label={category} checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} />
          ))}
          {categories.length === 0 && <p className="text-xs text-muted-foreground">No categories</p>}
        </FilterSection>

        {/* City / Location — common to all */}
        <FilterSection title="Location" sectionKey="city">
          {cities.map((city) => (
            <CheckboxItem key={city} label={city} checked={selectedCities.includes(city)} onChange={() => toggleCity(city)} />
          ))}
          {cities.length === 0 && <p className="text-xs text-muted-foreground">No locations</p>}
        </FilterSection>



        <FilterSection title="Price Range" sectionKey="price">
          {activePriceRanges.map((range, idx) => (
            <CheckboxItem key={range.label} label={range.label} checked={selectedPriceRanges.includes(idx)} onChange={() => togglePriceRange(idx)} />
          ))}
        </FilterSection>

        {/* ── Venue-specific filters ── */}
        {activeServiceType === "venue" && (
          <>
            <FilterSection title="Guest Capacity" sectionKey="capacity">
              {VENUE_CAPACITY_OPTIONS.map((opt) => (
                <CheckboxItem key={opt.value} label={opt.label} checked={selectedCapacity.includes(opt.value)} onChange={() => toggleCapacity(opt.value)} />
              ))}
            </FilterSection>

            <FilterSection title="Amenities" sectionKey="amenities">
              {VENUE_AMENITY_OPTIONS.map((amenity) => (
                <CheckboxItem key={amenity} label={amenity} checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
              ))}
            </FilterSection>
          </>
        )}

        {/* ── Crew-specific filters ── */}
        {activeServiceType === "crew" && (
          <FilterSection title="Experience Level" sectionKey="experience">
            {CREW_EXPERIENCE_OPTIONS.map((opt) => (
              <CheckboxItem key={opt.value} label={opt.label} checked={selectedExperience.includes(opt.value)} onChange={() => toggleExperience(opt.value)} />
            ))}
          </FilterSection>
        )}

        {/* ── Availability: date picker + in-stock ── */}
        <FilterSection title="Availability" sectionKey="availability">
          <div className="space-y-2.5">
            <label className="block">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Check date</span>
              <div className="relative mt-1">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={availabilityDate ? availabilityDate.toISOString().split("T")[0] : ""}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setAvailabilityDate(e.target.value ? new Date(e.target.value + "T00:00:00") : null)}
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </label>
            {availabilityDate && (
              <button
                onClick={() => setAvailabilityDate(null)}
                className="text-[10px] text-primary hover:text-primary/80 font-medium"
              >
                Clear date filter
              </button>
            )}
            {activeServiceType === "rental" && (
              <CheckboxItem label="In Stock Only" checked={showInStock} onChange={() => setShowInStock(!showInStock)} />
            )}
          </div>
        </FilterSection>
      </div>
    );
  };

  return (
    <Layout hideNavbar>
      {/* Location Prompt Modal */}
      <LocationPrompt
        open={showPrompt}
        onClose={dismissPrompt}
        onDetectGPS={detectGPS}
        onPinCodeSubmit={setFromPinCode}
      />


      {/* Compact Amazon-style Header */}
      <EcommerceHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedSearchCategory={searchCategory}
        onSearchCategoryChange={setSearchCategory}
        allItems={(allItems || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          service_type: r.service_type,
          categories: r.categories,
          image_url: r.image_url,
          short_description: r.short_description,
        }))}
      />

      {/* Location + Radius bar */}
      {userLocation && (
        <LocationRadiusBar
          location={userLocation}
          radius={deliveryRadius}
          onRadiusChange={handleRadiusChange}
          onDetectGPS={detectGPS}
          onPinCode={(pin) => setFromPinCode(pin).catch(() => {})}
        />
      )}

      {/* Service Selection Strip */}
      <ServiceSelector activeService={activeService} onServiceChange={(service) => {
        setActiveService(service);
        if (service) {
          setTimeout(() => {
            document.getElementById("promo-banner")?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      }} />




      {/* Venue Search Bar — when venues selected */}
      {activeServiceType === "venue" && (
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <VenueSearchBar onSearch={(filters) => setVenueSearchFilters(filters)} />
        </div>
      )}

      {/* Crew Sub-tabs — when crew selected */}
      {activeServiceType === "crew" && (
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <CrewSubTabs activeTab={crewSubTab} onTabChange={setCrewSubTab} />
        </div>
      )}

      {/* Category Quick Browse Strip with Icons — only when a service is selected */}
      {!isDiscoveryView && (
        <CategoryIconStrip
          categories={quickBrowseCategories}
          activeCategory={activeQuickCat}
          onCategoryChange={(val) => setActiveQuickCat(val === activeQuickCat ? "" : val)}
          activeService={activeServiceType}
        />
      )}

      {/* Stats/Social Proof Bar - only on discovery view */}
      {isDiscoveryView && <TrustStrip />}

      {/* Promotional Banner Carousel */}
      <div id="promo-banner">
        <Suspense fallback={null}>
          <PromoBannerCarousel
          serviceType={activeServiceType}
          onCtaClick={(ids) => {
            setPromoFilterIds(ids);
            setSelectedCategories([]);
            setActiveQuickCat("");
            setSearchTerm("");
            setActiveService("");
            setTimeout(() => {
              document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
        />
        </Suspense>
      </div>

      {/* Discovery Rows — shown on default landing */}
      {isDiscoveryView && (
        <>
          <DiscoverySection allItems={allItems} userLocation={userLocation} discoveryBestRentals={discoveryBestRentals} discoveryBestInCity={discoveryBestInCity} discoveryBestCrew={discoveryBestCrew} discoveryTopVenues={discoveryTopVenues} featuredItems={featuredProducts} />
          <EventPackages />
          <div className="container mx-auto px-4 sm:px-6">
            <Suspense fallback={null}><LookbookSection /></Suspense>
          </div>
          <HowItWorks />
        </>
      )}

      {/* Main Content with Sidebar — hidden in discovery view */}
      {!isDiscoveryView && (
        <section className="py-4 sm:py-6 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-4">
            <EcommerceBreadcrumbs activeCategory={activeDisplayCategory} searchTerm={searchTerm} />

            <div className="max-w-7xl mx-auto flex gap-5">
              <aside className="hidden lg:block w-56 flex-shrink-0">
                <div className="sticky top-20 bg-card rounded-xl border border-border/60 p-4 shadow-soft overflow-y-auto max-h-[calc(100vh-6rem)]">
                  <SidebarFilters />
                </div>
              </aside>

              <div className="flex-1 min-w-0">
                {mobileSidebarOpen && (
                  <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border p-5 overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Filters</h3>
                        <button onClick={() => setMobileSidebarOpen(false)}>
                          <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </div>
                      <SidebarFilters />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-card rounded-lg border border-border/60 px-4 py-2.5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileSidebarOpen(true)}
                      className="lg:hidden flex items-center gap-2 text-xs font-medium text-foreground border border-border rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
                    >
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px]">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {debouncedSearch !== searchTerm ? (
                        <span className="text-muted-foreground">Searching...</span>
                      ) : (
                        <>
                          <span className="font-semibold text-foreground">{filteredRentals.length}</span> result{filteredRentals.length !== 1 ? "s" : ""}
                          {debouncedSearch && <span> for &ldquo;<span className="text-primary">{debouncedSearch}</span>&rdquo;</span>}
                          {availabilityDate && <span> &middot; available {availabilityDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                        </>
                      )}
                    </span>
                    {availabilityDate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                        <Calendar className="h-3 w-3" />
                        {availabilityDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        <button onClick={() => setAvailabilityDate(null)} className="ml-0.5 hover:text-primary/70">&times;</button>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="text-xs bg-background border border-border rounded-md px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="rating">Highest Rated</option>
                    </select>

                    <div className="lg:hidden flex items-center border border-border rounded-md overflow-hidden">
                      <button onClick={() => setMobileView("list")} className={`p-1.5 transition-colors ${mobileView === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setMobileView("two")} className={`p-1.5 transition-colors ${mobileView === "two" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                        <Grid2X2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setMobileView("one")} className={`p-1.5 transition-colors ${mobileView === "one" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                        <Square className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vendor store banner */}
                {vendorFilterId && (
                  <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-lg bg-accent/10 border border-accent/20">
                    <Store className="h-5 w-5 text-accent-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        All items by {vendorStoreProfile?.company_name || vendorStoreProfile?.full_name || "Vendor"}
                      </p>
                      <p className="text-xs text-muted-foreground">Browse their full catalog</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { searchParams.delete("vendor"); setSearchParams(searchParams); }}
                      className="text-xs gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Clear
                    </Button>
                  </div>
                )}

                {promoFilterIds.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-sm font-medium text-primary">Showing promo items</span>
                    <button
                      onClick={() => setPromoFilterIds([])}
                      className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Clear
                    </button>
                  </div>
                )}

                <div id="product-grid">
                  {filteredRentals.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Search className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        No results found{debouncedSearch && <> for &ldquo;{debouncedSearch}&rdquo;</>}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1.5 mb-5">
                        Try adjusting your search or filters, or browse popular categories below
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {["Tents & Structures", "Stages", "Lighting", "Furniture", "Sound Systems"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => { setSearchTerm(cat); setDebouncedSearch(cat); }}
                            className="px-4 py-2 border border-border rounded-full text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      {(debouncedSearch || availabilityDate || activeFilterCount > 0) && (
                        <button
                          onClick={() => { setSearchTerm(""); setDebouncedSearch(""); setAvailabilityDate(null); clearAllFilters(); }}
                          className="text-sm text-primary hover:text-primary/80 font-medium"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`grid gap-3 sm:gap-4 ${
                        mobileView === "list" ? "grid-cols-1" : mobileView === "two" ? "grid-cols-2" : "grid-cols-1"
                      } sm:grid-cols-2 lg:grid-cols-3`}
                    >
                      {filteredRentals.map((rental) => (
                        <div key={rental.id} className="relative group/card">
                          {activeServiceType === "venue" ? (
                            <VenueCard venue={rental} viewMode={mobileView} />
                          ) : activeServiceType === "crew" ? (
                            <CrewCard crew={rental} viewMode={mobileView} />
                          ) : (
                            <EnhancedProductCard rental={rental} viewMode={mobileView} />
                          )}

                          {/* Unavailable overlay */}
                          {rental._isUnavailable && availabilityDate && (
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl z-10 flex items-end justify-center pb-6 pointer-events-none">
                              <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-xs font-medium px-3 py-1.5 rounded-full">
                                Unavailable on {availabilityDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          )}

                          {/* WhatsApp share button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const url = `${window.location.origin}/ecommerce/${rental.id}`;
                              const text = `Check out ${rental.title} on Evnting — ₹${(rental.price_value || 0).toLocaleString("en-IN")}/day\n${url}`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                            }}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity z-20"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4 text-green-600" />
                          </button>

                          {activeServiceType === "venue" && (
                            <label className="absolute top-2 right-12 z-20 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-md px-1.5 py-1 cursor-pointer border border-border shadow-sm">
                              <Checkbox
                                checked={compareIds.includes(rental.id)}
                                onCheckedChange={() => toggleCompare(rental.id)}
                                className="h-3.5 w-3.5"
                              />
                              <span className="text-[10px] font-medium">Compare</span>
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Compare sticky bar */}
      {compareIds.length >= 2 && (
        <div className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={() => setCompareOpen(true)}
            className="rounded-full shadow-xl gap-2 px-6"
          >
            <GitCompareArrows className="h-4 w-4" />
            Compare {compareIds.length} Venues
          </Button>
        </div>
      )}

      <Suspense fallback={null}>
        <VenueCompare
          items={compareItems}
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
          onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        />
      </Suspense>

      {/* Floating Cart — hidden on mobile where bottom nav takes over */}
      {items.length > 0 && (
        <div className="hidden md:block fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button onClick={() => navigate("/cart")} size="lg" className="rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart ({items.length})
          </Button>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav cartCount={items.length} />
    </Layout>
  );
};

export default Ecommerce;
