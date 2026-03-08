import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Search, ChevronDown, ChevronUp, X, List, Grid2X2, Square, Eye, ClipboardList } from "lucide-react";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Event categories will be built dynamically from rental data

const Ecommerce = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { items } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    city: false,
    price: false,
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "two" | "one">("two");
  const [activeQuickCat, setActiveQuickCat] = useState("");

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
    return rentals.filter((rental) => {
      const matchesSearch =
        !searchTerm ||
        rental.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.search_keywords?.toLowerCase().includes(searchTerm.toLowerCase());
      const allCats = [...selectedCategories];
      if (activeQuickCat && !allCats.includes(activeQuickCat)) allCats.push(activeQuickCat);
      const matchesCategory =
        allCats.length === 0 || rental.categories?.some((c) => 
          allCats.some((selected) => c.toLowerCase() === selected.toLowerCase())
        );
      const matchesCity =
        selectedCities.length === 0 ||
        (rental.address?.trim() && selectedCities.includes(rental.address.trim()));
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [rentals, searchTerm, selectedCategories, selectedCities, activeQuickCat]);

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

  const formatPrice = (rental: any) => {
    if (rental.price_value != null) {
      return `₹${rental.price_value.toLocaleString()} / ${rental.pricing_unit || "Per Day"}`;
    }
    if (rental.price_range) return `₹${rental.price_range}`;
    return null;
  };

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
    <Layout>
      {/* Hero with Central Search */}
      <section className="relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/event-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 container mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight mb-3">
            Premium Event Rentals
          </h1>
          <p className="text-base sm:text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Find everything you need — from staging and lighting to catering and decor.
          </p>

          {/* Central Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for equipment, decor, lighting, staging..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-background text-foreground text-base sm:text-lg shadow-xl border-0 focus:outline-none focus:ring-4 focus:ring-primary-foreground/20 transition-all placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Event Category Quick Browse */}
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="overflow-x-auto scrollbar-hide py-4">
            <div className="flex gap-2 sm:gap-3 justify-start sm:justify-center min-w-max">
              {quickBrowseCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveQuickCat(cat.value === activeQuickCat ? "" : cat.value)}
                  className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                    (cat.value === "" && !activeQuickCat) || activeQuickCat === cat.value
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
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

      {/* Toolbar */}
      <section className="border-b border-border bg-background sticky top-0 z-20">
        <div className="container mx-auto px-6 sm:px-8 lg:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden flex items-center gap-2 text-sm font-medium text-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors"
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <span className="text-sm text-muted-foreground">
              {filteredRentals.length} product{filteredRentals.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/ecommerce/orders")} variant="outline" size="sm" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Orders
            </Button>
            <Button onClick={() => navigate("/cart")} variant="outline" size="sm" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Cart ({items.length})
            </Button>
          </div>
        </div>

        {/* Mobile: View Toggle */}
        <div className="lg:hidden container mx-auto px-4 py-2 flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden flex-shrink-0">
            <button onClick={() => setMobileView("list")} className={`p-2 transition-colors ${mobileView === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`} aria-label="List view">
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setMobileView("two")} className={`p-2 transition-colors ${mobileView === "two" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`} aria-label="Two column view">
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button onClick={() => setMobileView("one")} className={`p-2 transition-colors ${mobileView === "one" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`} aria-label="Single column view">
              <Square className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="products" className="py-8 sm:py-10">
        <div className="container mx-auto px-6 sm:px-8 lg:px-4">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-20">
                <SidebarContent />
              </div>
            </aside>

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

            <div className="flex-1 min-w-0">
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
                  } sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`}
                >
                  {filteredRentals.map((rental) => (
                    <Card
                      key={rental.id}
                      className={`group overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow duration-300 rounded-xl cursor-pointer ${
                        mobileView === "list" ? "flex flex-row sm:flex-col" : ""
                      }`}
                      onClick={() => navigate(`/ecommerce/${rental.id}`)}
                    >
                      <div
                        className={`overflow-hidden bg-muted relative ${
                          mobileView === "list" ? "w-28 h-28 flex-shrink-0 sm:w-full sm:h-auto sm:aspect-square" : "aspect-square"
                        }`}
                      >
                        {rental.image_urls && rental.image_urls.length > 0 ? (
                          <MultiImageCarousel images={rental.image_urls} title={rental.title} className="!aspect-square !rounded-none" />
                        ) : rental.image_url ? (
                          <img src={rental.image_url} alt={rental.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">No Image</span>
                          </div>
                        )}
                        {rental.categories && rental.categories.length > 0 && mobileView !== "list" && (
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            {rental.categories.slice(0, 2).map((cat) => (
                              <Badge key={cat} className="bg-foreground text-background text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <CardContent className="p-3 space-y-1.5">
                        <h3 className="font-semibold text-foreground text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {rental.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">
                          {rental.short_description}
                        </p>
                        {formatPrice(rental) && (
                          <p className="text-xs sm:text-sm font-semibold text-foreground">
                            {formatPrice(rental)}
                          </p>
                        )}
                        <div className="flex gap-1.5 pt-1.5">
                          <Button
                            onClick={(e) => { e.stopPropagation(); navigate(`/ecommerce/${rental.id}`); }}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-[11px] h-8"
                          >
                            <Eye className="mr-1 h-3 w-3" />View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Cart Button */}
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
