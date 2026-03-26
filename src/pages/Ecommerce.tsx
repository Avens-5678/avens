import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Layout/Navbar";
import Layout from "@/components/Layout/Layout";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, X, List, Grid2X2, Square, ShoppingCart, MapPin, Users, Building2, Wrench } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import EcommerceHeader from "@/components/ecommerce/EcommerceHeader";
import TrustStrip from "@/components/ecommerce/TrustStrip";
import EcommerceBreadcrumbs from "@/components/ecommerce/EcommerceBreadcrumbs";
import EnhancedProductCard from "@/components/ecommerce/EnhancedProductCard";
import PromoBannerCarousel from "@/components/ecommerce/PromoBannerCarousel";
import ServiceSelector from "@/components/ecommerce/ServiceSelector";
import CategoryIconStrip from "@/components/ecommerce/CategoryIconStrip";
import LocationPrompt from "@/components/ecommerce/LocationPrompt";
import DiscoveryRow from "@/components/ecommerce/DiscoveryRow";
import { useUserLocation } from "@/hooks/useUserLocation";

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

const Ecommerce = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { items } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [showInStock, setShowInStock] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
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

  const { location: userLocation, showPrompt, detectGPS, setFromPinCode, clearLocation, dismissPrompt } = useUserLocation();

  // Pull-down navbar reveal logic
  const [showNavbar, setShowNavbar] = useState(false);
  const lastScrollY = useRef(0);
  const navbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideNavbar = useCallback(() => {
    setShowNavbar(false);
    if (navbarTimerRef.current) {
      clearTimeout(navbarTimerRef.current);
      navbarTimerRef.current = null;
    }
  }, []);

  const revealNavbar = useCallback(() => {
    setShowNavbar(true);
    if (navbarTimerRef.current) clearTimeout(navbarTimerRef.current);
    navbarTimerRef.current = setTimeout(() => {
      setShowNavbar(false);
      navbarTimerRef.current = null;
    }, 15000);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY.current - 30 && currentY > 60) {
        if (!showNavbar) revealNavbar();
      }
      if (currentY <= 10) {
        hideNavbar();
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (navbarTimerRef.current) clearTimeout(navbarTimerRef.current);
    };
  }, [showNavbar, revealNavbar, hideNavbar]);

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
    if (!rentals) return [];
    const cats = new Set<string>();
    const itemsForCats = activeServiceType
      ? rentals.filter((r: any) => (r.service_type || "rental") === activeServiceType)
      : rentals;
    itemsForCats.forEach((r: any) => r.categories?.forEach((c: string) => cats.add(c)));
    return Array.from(cats).sort();
  }, [rentals, activeServiceType]);

  const quickBrowseCategories = useMemo(() => {
    return [{ label: "All", value: "" }, ...categories.map(c => ({ label: c, value: c }))];
  }, [categories]);

  const cities = useMemo(() => {
    if (!rentals) return [];
    const citySet = new Set<string>();
    const itemsForCities = activeServiceType
      ? rentals.filter((r: any) => (r.service_type || "rental") === activeServiceType)
      : rentals;
    itemsForCities.forEach((r) => {
      if (r.address?.trim()) citySet.add(r.address.trim());
    });
    return Array.from(citySet).sort();
  }, [rentals, activeServiceType]);

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

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];

    if (promoFilterIds.length > 0) {
      let results = rentals.filter((r) => promoFilterIds.includes(r.id));
      if (searchTerm) {
        results = results.filter((r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return results;
    }

    let results = rentals.filter((rental) => {
      const matchesSearch =
        !searchTerm ||
        rental.title.toLowerCase().includes(searchTerm.toLowerCase());
      const allCats = [...selectedCategories];
      if (activeQuickCat && !allCats.includes(activeQuickCat)) allCats.push(activeQuickCat);
      if (searchCategory && !allCats.includes(searchCategory)) allCats.push(searchCategory);
      const matchesCategory =
        allCats.length === 0 || rental.categories?.some((c) =>
          allCats.some((selected) => c.toLowerCase() === selected.toLowerCase())
        );
      const matchesCity =
        selectedCities.length === 0 ||
        (rental.address?.trim() && selectedCities.includes(rental.address.trim()));

      const matchesPrice =
        selectedPriceRanges.length === 0 ||
        selectedPriceRanges.some((idx) => {
          const range = activePriceRanges[idx];
          const price = rental.price_value ?? 0;
          return price >= range.min && price < range.max;
        });

      const matchesAvailability = !showInStock || (rental.quantity != null && rental.quantity > 0);

      const matchesService =
        !activeServiceType ||
        ((rental as any).service_type || "rental") === activeServiceType;

      // Venue amenity filter
      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((a) => ((rental as any).amenities || []).includes(a));

      // Venue capacity filter
      const matchesCapacity =
        selectedCapacity.length === 0 ||
        selectedCapacity.includes((rental as any).guest_capacity || "");

      // Crew experience filter
      const matchesExperience =
        selectedExperience.length === 0 ||
        selectedExperience.includes((rental as any).experience_level || "");

      return matchesSearch && matchesCategory && matchesCity && matchesService && matchesPrice && matchesAvailability && matchesAmenities && matchesCapacity && matchesExperience;
    });

    switch (sortBy) {
      case "price_low":
        results.sort((a, b) => (a.price_value ?? Infinity) - (b.price_value ?? Infinity));
        break;
      case "price_high":
        results.sort((a, b) => (b.price_value ?? 0) - (a.price_value ?? 0));
        break;
      case "newest":
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rating":
        results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }

    return results;
  }, [rentals, searchTerm, selectedCategories, selectedCities, activeQuickCat, searchCategory, sortBy, promoFilterIds, activeServiceType, selectedPriceRanges, showInStock, activePriceRanges, selectedAmenities, selectedCapacity, selectedExperience]);

  // Discovery rows for default landing view
  const isDiscoveryView = !activeService && !searchTerm && !activeQuickCat && !searchCategory && selectedCategories.length === 0 && promoFilterIds.length === 0;

  const discoveryBestRentals = useMemo(() => {
    if (!rentals) return [];
    return rentals
      .filter((r: any) => (r.service_type || "rental") === "rental" && r.is_active)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12);
  }, [rentals]);

  const discoveryBestInCity = useMemo(() => {
    if (!rentals || !userLocation?.cityName) return [];
    const city = userLocation.cityName.toLowerCase();
    return rentals
      .filter((r: any) => r.address?.toLowerCase().includes(city))
      .slice(0, 12);
  }, [rentals, userLocation]);

  const discoveryBestCrew = useMemo(() => {
    if (!rentals) return [];
    return rentals
      .filter((r: any) => (r.service_type || "rental") === "crew" && r.is_active)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12);
  }, [rentals]);

  const discoveryTopVenues = useMemo(() => {
    if (!rentals) return [];
    return rentals
      .filter((r: any) => (r.service_type || "rental") === "venue" && r.is_active)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12);
  }, [rentals]);

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

  const activeFilterCount = selectedCategories.length + selectedCities.length + selectedPriceRanges.length + (showInStock ? 1 : 0) + selectedAmenities.length + selectedCapacity.length + selectedExperience.length;
  const activeDisplayCategory = activeQuickCat || searchCategory || (selectedCategories.length === 1 ? selectedCategories[0] : "");

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
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

        {/* Price — different ranges per service */}
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

        {/* ── Rental-specific: Availability ── */}
        {activeServiceType === "rental" && (
          <FilterSection title="Availability" sectionKey="availability">
            <CheckboxItem label="In Stock Only" checked={showInStock} onChange={() => setShowInStock(!showInStock)} />
          </FilterSection>
        )}
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

      {/* Pull-down navbar */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          showNavbar ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Navbar />
      </div>

      {/* Compact Amazon-style Header */}
      <EcommerceHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedSearchCategory={searchCategory}
        onSearchCategoryChange={setSearchCategory}
      />

      {/* Location bar below header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <button
            onClick={() => clearLocation()}
            className="flex items-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {userLocation ? (
              <span>
                Deliver to <span className="font-semibold text-foreground">{userLocation.cityName || userLocation.pinCode || "Your Location"}</span>
              </span>
            ) : (
              <span>Select your location</span>
            )}
          </button>
        </div>
      </div>

      {/* Service Selection Strip */}
      <ServiceSelector activeService={activeService} onServiceChange={setActiveService} />

      {/* Category Quick Browse Strip with Icons — only when a service is selected */}
      {!isDiscoveryView && (
        <CategoryIconStrip
          categories={quickBrowseCategories}
          activeCategory={activeQuickCat}
          onCategoryChange={(val) => setActiveQuickCat(val === activeQuickCat ? "" : val)}
          activeService={activeServiceType}
        />
      )}

      {/* Promotional Banner Carousel */}
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

      {/* Trust Strip */}
      <TrustStrip />

      {/* Discovery Rows — shown on default landing */}
      {isDiscoveryView && (
        <div className="bg-background">
          <DiscoveryRow title="Discover Best Rentals" subtitle="Top-rated equipment for your events" items={discoveryBestRentals} />
          {discoveryBestInCity.length > 0 && (
            <DiscoveryRow title={`Discover Best in ${userLocation?.cityName || "Your City"}`} subtitle="Popular items near you" items={discoveryBestInCity} />
          )}
          {discoveryBestCrew.length > 0 && (
            <DiscoveryRow title="Best Crew for Your Event" subtitle="Skilled professionals ready to help" items={discoveryBestCrew} />
          )}
          {discoveryTopVenues.length > 0 && (
            <DiscoveryRow title="Top Venues Near You" subtitle="Perfect spaces for every occasion" items={discoveryTopVenues} />
          )}
        </div>
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
                      <span className="font-semibold text-foreground">{filteredRentals.length}</span> result{filteredRentals.length !== 1 ? "s" : ""}
                      {searchTerm && <span> for "<span className="text-primary">{searchTerm}</span>"</span>}
                    </span>
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
                      <option value="rating">Rating</option>
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
                    <div className="text-center py-20">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-foreground">No Items Found</h3>
                      <p className="text-muted-foreground text-sm">
                        {searchTerm ? "Try adjusting your search terms" : "No items available at the moment"}
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`grid gap-3 sm:gap-4 ${
                        mobileView === "list" ? "grid-cols-1" : mobileView === "two" ? "grid-cols-2" : "grid-cols-1"
                      } sm:grid-cols-2 lg:grid-cols-3`}
                    >
                      {filteredRentals.map((rental) => (
                        <EnhancedProductCard key={rental.id} rental={rental} viewMode={mobileView} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Floating Cart */}
      {items.length > 0 && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button onClick={() => navigate("/cart")} size="lg" className="rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart ({items.length})
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Ecommerce;
