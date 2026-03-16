import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Layout/Navbar";
import Layout from "@/components/Layout/Layout";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, X, List, Grid2X2, Square, ShoppingCart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import EcommerceHeader from "@/components/ecommerce/EcommerceHeader";
import TrustStrip from "@/components/ecommerce/TrustStrip";
import EcommerceBreadcrumbs from "@/components/ecommerce/EcommerceBreadcrumbs";
import EnhancedProductCard from "@/components/ecommerce/EnhancedProductCard";
import PromoBannerCarousel from "@/components/ecommerce/PromoBannerCarousel";

type SortOption = "relevance" | "price_low" | "price_high" | "newest" | "rating";

const Ecommerce = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { items } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    city: false,
    price: false,
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "two" | "one">("two");
  const [activeQuickCat, setActiveQuickCat] = useState("");

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
      // User scrolled up by at least 30px
      if (currentY < lastScrollY.current - 30 && currentY > 60) {
        if (!showNavbar) revealNavbar();
      }
      // User scrolled back to top — hide immediately
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

  const categories = useMemo(() => {
    if (!rentals) return [];
    const cats = new Set<string>();
    rentals.forEach((r) => r.categories?.forEach((c) => cats.add(c)));
    return Array.from(cats).sort();
  }, [rentals]);

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
      return matchesSearch && matchesCategory && matchesCity;
    });

    // Sort
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
  }, [rentals, searchTerm, selectedCategories, selectedCities, activeQuickCat, searchCategory, sortBy]);

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

  const activeFilterCount = selectedCategories.length + selectedCities.length;
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

  const SidebarContent = () => (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={() => { setSelectedCategories([]); setSelectedCities([]); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <Separator />
      <div className="py-3">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-2"
        >
          <span>Category</span>
          {expandedSections.categories ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.categories && categories.length > 0 && (
          <div className="space-y-2.5 pt-2 pl-1">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      <Separator />
      <div className="py-3">
        <button
          onClick={() => toggleSection("city")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-2"
        >
          <span>City</span>
          {expandedSections.city ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.city && cities.length > 0 && (
          <div className="space-y-2.5 pt-2 pl-1">
            {cities.map((city) => (
              <label key={city} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={selectedCities.includes(city)}
                  onCheckedChange={() => toggleCity(city)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {city}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      <Separator />
      <div className="py-3">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-2"
        >
          <span>Price</span>
          {expandedSections.price ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.price && (
          <div className="space-y-2.5 pt-2 pl-1">
            {["Under ₹5,000", "₹5,000–₹15,000", "₹15,000–₹50,000", "₹50,000+"].map((range) => (
              <label key={range} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox className="border-border" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {range}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout hideNavbar>
      {/* Pull-down navbar above search bar */}
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

      {/* Category Quick Browse Strip */}
      <section className="border-b border-border bg-card/80 sticky top-14 sm:top-16 z-40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="overflow-x-auto scrollbar-hide py-2.5">
            <div className="flex gap-2 sm:gap-3 justify-start sm:justify-center min-w-max">
              {quickBrowseCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveQuickCat(cat.value === activeQuickCat ? "" : cat.value)}
                  className={`flex-shrink-0 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                    (cat.value === "" && !activeQuickCat) || activeQuickCat === cat.value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banner Carousel */}
      <PromoBannerCarousel />

      {/* Trust Strip */}
      <TrustStrip />

      {/* Main Content */}
      <section className="py-4 sm:py-6 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-4">
          {/* Breadcrumbs */}
          <EcommerceBreadcrumbs activeCategory={activeDisplayCategory} searchTerm={searchTerm} />

          <div className="max-w-7xl mx-auto">
            {/* Mobile Sidebar */}
            {mobileSidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <button onClick={() => setMobileSidebarOpen(false)}>
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                  <SidebarContent />
                </div>
              </div>
            )}

            {/* Toolbar: Sort + View + Filters */}
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
                {/* Sort */}
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

                {/* Mobile View Toggle */}
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

            {/* Product Grid */}
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
                } sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}
              >
                {filteredRentals.map((rental) => (
                  <EnhancedProductCard key={rental.id} rental={rental} viewMode={mobileView} />
                ))}
              </div>
            )}
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
