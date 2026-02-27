// Ecommerce storefront page
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Plus, Check, Search, ChevronDown, ChevronUp, X, List, Grid2X2, Square, Trash2, ArrowRight } from "lucide-react";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import ecommerceBanner from "@/assets/ecommerce-banner.jpg";

const Ecommerce = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { items, addItem, removeItem, isInCart } = useCart();
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

  const categories = useMemo(() => {
    if (!rentals) return [];
    const cats = new Set<string>();
    rentals.forEach(r => r.categories?.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [rentals]);

  const cities = useMemo(() => {
    if (!rentals) return [];
    const citySet = new Set<string>();
    rentals.forEach(r => {
      if (r.address?.trim()) citySet.add(r.address.trim());
    });
    return Array.from(citySet).sort();
  }, [rentals]);

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    return rentals.filter((rental) => {
      const matchesSearch = !searchTerm ||
        rental.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 ||
        rental.categories?.some(c => selectedCategories.includes(c));
      const matchesCity = selectedCities.length === 0 ||
        (rental.address?.trim() && selectedCities.includes(rental.address.trim()));
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [rentals, searchTerm, selectedCategories, selectedCities]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const activeFilterCount = selectedCategories.length + selectedCities.length;

  const formatPrice = (rental: any) => {
    if (rental.price_value != null) {
      return `₹${rental.price_value.toLocaleString()} / ${rental.pricing_unit || 'Per Day'}`;
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
      {/* City Filter */}
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
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="relative h-[280px] sm:h-[320px] lg:h-[360px]">
          <img
            src={ecommerceBanner}
            alt="Premium Event Rentals"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 sm:px-8 lg:px-4">
              <Badge variant="secondary" className="mb-4 bg-secondary/90 backdrop-blur-sm">
                <Package className="mr-2 h-4 w-4" />
                Equipment Rental
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Premium Event Rentals
              </h1>
              <p className="text-base sm:text-lg text-white/80 mt-3 max-w-2xl">
                Browse our extensive collection of high-quality equipment and decor for your special event.
              </p>
              <Button className="mt-6 bg-secondary hover:bg-secondary/90 text-white" asChild>
                <a href="#products">
                  Browse Equipment <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
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
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {filteredRentals.length} product{filteredRentals.length !== 1 ? "s" : ""}
            </span>
            <Button onClick={() => navigate("/cart")} variant="outline" size="sm" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Cart ({items.length})
            </Button>
          </div>
        </div>

        {/* Mobile: Horizontal Category Scroll + View Toggle */}
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
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-1">
              <button
                onClick={() => setSelectedCategories([])}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedCategories.length === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                    selectedCategories.includes(cat) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
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
                <div className={`grid gap-3 sm:gap-4 ${
                  mobileView === "list" ? "grid-cols-1"
                    : mobileView === "two" ? "grid-cols-2"
                    : "grid-cols-1"
                } sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`}>
                  {filteredRentals.map((rental) => (
                    <Card
                      key={rental.id}
                      className={`group overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow duration-300 rounded-xl cursor-pointer ${
                        mobileView === "list" ? "flex flex-row sm:flex-col" : ""
                      }`}
                      onClick={() => navigate(`/ecommerce/${rental.id}`)}
                    >
                      {/* Image */}
                      <div className={`overflow-hidden bg-muted relative ${
                        mobileView === "list"
                          ? "w-28 h-28 flex-shrink-0 sm:w-full sm:h-auto sm:aspect-square"
                          : "aspect-square"
                      }`}>
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

                      {/* Content */}
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

                        {/* Action Buttons */}
                        <div className="flex gap-1.5 pt-1.5">
                          {isInCart(rental.id) ? (
                            <>
                              <Button
                                onClick={(e) => { e.stopPropagation(); navigate("/cart"); }}
                                variant="secondary"
                                size="sm"
                                className="flex-1 text-[11px] h-8"
                              >
                                <Check className="mr-1 h-3 w-3" />Added
                              </Button>
                              <Button
                                onClick={(e) => { e.stopPropagation(); removeItem(rental.id); }}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                addItem({
                                  id: rental.id,
                                  title: rental.title,
                                  price_value: rental.price_value,
                                  pricing_unit: rental.pricing_unit,
                                  price_range: rental.price_range,
                                  image_url: rental.image_url,
                                  quantity: 1,
                                });
                              }}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-[11px] h-8"
                            >
                              <Plus className="mr-1 h-3 w-3" />Add
                            </Button>
                          )}
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
