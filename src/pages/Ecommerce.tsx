import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import CartModal from "@/components/Cart/CartModal";
import { Package, ShoppingCart, Plus, Check, Search, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const Ecommerce = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { items, addItem, isInCart } = useCart();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    price: false,
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Extract unique categories from rentals
  const categories = useMemo(() => {
    if (!rentals) return [];
    const cats = new Set<string>();
    rentals.forEach(r => r.categories?.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [rentals]);

  // Filter rentals
  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    return rentals.filter((rental) => {
      const matchesSearch = !searchTerm ||
        rental.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 ||
        rental.categories?.some(c => selectedCategories.includes(c));
      return matchesSearch && matchesCategory;
    });
  }, [rentals, searchTerm, selectedCategories]);

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

  const activeFilterCount = selectedCategories.length;

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
      {/* Filter Header */}
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
            onClick={() => setSelectedCategories([])}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Separator />

      {/* Categories Section */}
      <div className="py-3">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-2"
        >
          <span>Category</span>
          {expandedSections.categories ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expandedSections.categories && categories.length > 0 && (
          <div className="space-y-2.5 pt-2 pl-1">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 cursor-pointer group"
              >
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

      {/* Price Section */}
      <div className="py-3">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground py-2"
        >
          <span>Price</span>
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
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
      {/* Hero Header */}
      <section className="pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 border-b border-border">
        <div className="container mx-auto px-6 sm:px-8 lg:px-4">
          <Badge variant="secondary" className="mb-4">
            <Package className="mr-2 h-4 w-4" />
            Equipment Rental
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Premium Event Rentals
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-2xl">
            Browse our extensive collection of high-quality equipment and decor for your special event.
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="border-b border-border bg-background sticky top-0 z-20">
        <div className="container mx-auto px-6 sm:px-8 lg:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile filter toggle */}
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

            {/* Search */}
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
            <Button
              onClick={() => setCartModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart ({items.length})
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content: Sidebar + Grid */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-6 sm:px-8 lg:px-4">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-20">
                <SidebarContent />
              </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
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

            {/* Product Grid */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {filteredRentals.map((rental) => (
                    <Card
                      key={rental.id}
                      className="group overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow duration-300 rounded-2xl"
                    >
                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-muted">
                        {rental.image_urls && rental.image_urls.length > 0 ? (
                          <MultiImageCarousel
                            images={rental.image_urls}
                            title={rental.title}
                            className="!aspect-square !rounded-none"
                          />
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

                        {/* Category badges overlaid on image */}
                        {rental.categories && rental.categories.length > 0 && (
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            {rental.categories.slice(0, 2).map((cat) => (
                              <Badge
                                key={cat}
                                className="bg-foreground text-background text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm"
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="p-4 space-y-2">
                        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {rental.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {rental.short_description}
                        </p>
                        {rental.price_range && (
                          <p className="text-sm font-semibold text-foreground">
                            ₹{rental.price_range}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => addItem({
                              id: rental.id,
                              title: rental.title,
                              price_range: rental.price_range,
                              image_url: rental.image_url
                            })}
                            variant={isInCart(rental.id) ? "secondary" : "outline"}
                            size="sm"
                            className="flex-1 text-xs"
                            disabled={isInCart(rental.id)}
                          >
                            {isInCart(rental.id) ? (
                              <><Check className="mr-1.5 h-3.5 w-3.5" />Added</>
                            ) : (
                              <><Plus className="mr-1.5 h-3.5 w-3.5" />Add</>
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-primary text-primary-foreground text-xs"
                                onClick={() => setSelectedRental(rental)}
                              >
                                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                                Enquire
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[90vw] max-w-sm sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0">
                              <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                                <InquiryForm
                                  formType="rental"
                                  rentalId={selectedRental?.id}
                                  rentalTitle={selectedRental?.title}
                                  title="Equipment Inquiry"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
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
          <Button
            onClick={() => setCartModalOpen(true)}
            size="lg"
            className="rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart ({items.length})
          </Button>
        </div>
      )}

      <CartModal
        open={cartModalOpen}
        onOpenChange={setCartModalOpen}
      />
    </Layout>
  );
};

export default Ecommerce;
