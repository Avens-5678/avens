import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Layout/Navbar";
import Layout from "@/components/Layout/Layout";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, X, List, Grid2X2, Square, ShoppingCart, MapPin, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
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

const PRICE_RANGES = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹15,000", min: 5000, max: 15000 },
  { label: "₹15,000 – ₹50,000", min: 15000, max: 50000 },
  { label: "₹50,000+", min: 50000, max: Infinity },
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
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "two" | "one">("two");
  const [activeQuickCat, setActiveQuickCat] = useState("");
  const [activeService, setActiveService] = useState("");
  const [promoFilterIds, setPromoFilterIds] = useState<string[]>([]);

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
    rentals.forEach((r) => {
      if (r.address?.trim()) citySet.add(r.address.trim());
    });
    return Array.from(citySet).sort();
  }, [rentals]);

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

      // Price filter
      const matchesPrice =
        selectedPriceRanges.length === 0 ||
        selectedPriceRanges.some((idx) => {
          const range = PRICE_RANGES[idx];
          const price = rental.price_value ?? 0;
          return price >= range.min && price < range.max;
        });

      // Availability filter
      const matchesAvailability = !showInStock || (rental.quantity != null && rental.quantity > 0);

      const matchesService =
        !activeServiceType ||
        ((rental as any).service_type || "rental") === activeServiceType;
      return matchesSearch && matchesCategory && matchesCity && matchesService && matchesPrice && matchesAvailability;
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
  }, [rentals, searchTerm, selectedCategories, selectedCities, activeQuickCat, searchCategory, sortBy, promoFilterIds, activeServiceType, selectedPriceRanges, showInStock]);

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

  const activeFilterCount = selectedCategories.length + selectedCities.length + selectedPriceRanges.length + (showInStock ? 1 : 0);
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
  };

  const SidebarFilters = () => (
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
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Filters</h3>
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

      {/* Category */}
      <div className="py-3">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-1"
        >
          <span>Category</span>
          {expandedSections.categories ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.categories && categories.length > 0 && (
          <div className="space-y-2 pt-2 pl-1 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      <Separator />

      {/* City / Location */}
      <div className="py-3">
        <button
          onClick={() => toggleSection("city")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-1"
        >
          <span>Location</span>
          {expandedSections.city ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.city && cities.length > 0 && (
          <div className="space-y-2 pt-2 pl-1 max-h-48 overflow-y-auto">
            {cities.map((city) => (
              <label key={city} className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={selectedCities.includes(city)}
                  onCheckedChange={() => toggleCity(city)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {city}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      <Separator />

      {/* Price */}
      <div className="py-3">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-1"
        >
          <span>Price</span>
          {expandedSections.price ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.price && (
          <div className="space-y-2 pt-2 pl-1">
            {PRICE_RANGES.map((range, idx) => (
              <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  checked={selectedPriceRanges.includes(idx)}
                  onCheckedChange={() => togglePriceRange(idx)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      <Separator />

      {/* Availability */}
      <div className="py-3">
        <button
          onClick={() => toggleSection("availability")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-1"
        >
          <span>Availability</span>
          {expandedSections.availability ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.availability && (
          <div className="space-y-2 pt-2 pl-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox
                checked={showInStock}
                onCheckedChange={() => setShowInStock(!showInStock)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                In Stock Only
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

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

      {/* Category Quick Browse Strip with Icons */}
      <CategoryIconStrip
        categories={quickBrowseCategories}
        activeCategory={activeQuickCat}
        onCategoryChange={(val) => setActiveQuickCat(val === activeQuickCat ? "" : val)}
        activeService={activeServiceType}
      />

      {/* Promotional Banner Carousel */}
      <PromoBannerCarousel onCtaClick={(ids) => {
        setPromoFilterIds(ids);
        setSelectedCategories([]);
        setActiveQuickCat("");
        setSearchTerm("");
        setActiveService("");
        setTimeout(() => {
          document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }} />

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

      {/* Main Content with Sidebar */}
      <section className="py-4 sm:py-6 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-4">
          {/* Breadcrumbs */}
          <EcommerceBreadcrumbs activeCategory={activeDisplayCategory} searchTerm={searchTerm} />

          <div className="max-w-7xl mx-auto flex gap-5">
            {/* LEFT SIDEBAR — Desktop only */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-20 bg-card rounded-xl border border-border/60 p-4 shadow-soft overflow-y-auto max-h-[calc(100vh-6rem)]">
                <SidebarFilters />
              </div>
            </aside>

            {/* MAIN PRODUCT AREA */}
            <div className="flex-1 min-w-0">
              {/* Mobile Sidebar */}
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

              {/* Toolbar */}
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

              {/* Promo Filter Active Banner */}
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

              {/* Product Grid */}
              <div id="product-grid">
                {filteredRentals.length === 0 ? (
                  <div className="text-center py-20">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-foreground">No Items Found</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm ? "Try adjusting your search terms" : "No rental items available at the moment"}
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
