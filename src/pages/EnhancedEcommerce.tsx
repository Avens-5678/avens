import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import { Search, ShoppingCart, Star, Filter, Eye, Grid3X3, Grid2X2, Columns2, Rows3, MapPin } from "lucide-react";
import { AnimatedViewToggle } from "@/components/ui/animated-view-toggle";
import Layout from "@/components/layout/Layout";
import { AnimatedText } from "@/components/ui/animated-text";
import CartModal from "@/components/cart/CartModal";
import { ProductImageCarousel } from "@/components/ui/product-image-carousel";
const EnhancedEcommerce = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("3");
  const { data: rentals, isLoading } = useAllRentals();
  const { getItemCount } = useCart();

  const categories = useMemo(() => {
    if (!rentals) return ["All"];
    const uniqueCategories = Array.from(new Set(rentals.flatMap(rental => rental.categories || [])));
    return ["All", ...uniqueCategories];
  }, [rentals]);

  const cities = useMemo(() => {
    if (!rentals) return ["All"];
    const uniqueCities = Array.from(new Set(
      rentals.map(rental => rental.address?.trim()).filter(Boolean)
    )) as string[];
    return ["All", ...uniqueCities.sort()];
  }, [rentals]);

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    return rentals.filter(rental => {
      const matchesSearch = rental.title.toLowerCase().includes(searchTerm.toLowerCase()) || rental.description.toLowerCase().includes(searchTerm.toLowerCase()) || (rental.search_keywords && rental.search_keywords.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || (rental.categories && rental.categories.includes(selectedCategory));
      const matchesCity = selectedCity === "All" || (rental.address?.trim() === selectedCity);
      return matchesSearch && matchesCategory && matchesCity && rental.is_active;
    });
  }, [rentals, searchTerm, selectedCategory, selectedCity]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
    ));
  };

  const viewOptions = [
    { value: "list", label: "List", icon: Rows3 },
    { value: "2", label: "2 Cols", icon: Columns2 },
    { value: "3", label: "3 Cols", icon: Grid2X2 },
    { value: "4", label: "4 Cols", icon: Grid3X3 },
  ];

  const getGridClasses = () => {
    switch (viewMode) {
      case "list": return "flex flex-col space-y-4";
      case "2": return "grid grid-cols-1 xs:grid-cols-2 gap-4";
      case "3": return "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4";
      case "4": return "grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3";
      default: return "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4";
    }
  };

  if (isLoading) {
    return <Layout><div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div></Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-primary/5">
        {/* Hero Banner with Video */}
        <section className="relative w-full h-[320px] sm:h-[380px] lg:h-[420px] overflow-hidden">
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
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <AnimatedText>
              <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Equipment Rental
              </Badge>
            </AnimatedText>
            <AnimatedText delay={200}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                Premium Rental Collection
              </h1>
            </AnimatedText>
            <AnimatedText delay={400}>
              <p className="text-white/80 text-base sm:text-lg max-w-2xl mb-6">
                Discover our extensive collection of high-quality equipment and furniture for your events.
              </p>
            </AnimatedText>
            {/* Search Bar on Hero */}
            <AnimatedText delay={500}>
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search equipment, furniture, or services..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-full bg-background/95 backdrop-blur-sm border-0 shadow-2xl"
                />
              </div>
            </AnimatedText>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 max-w-7xl py-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-44 h-10 border-border bg-muted/50">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-44 h-10 border-border bg-muted/50">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <AnimatedViewToggle options={viewOptions} value={viewMode} onValueChange={setViewMode} className="bg-muted/50" />
                <Button onClick={() => setCartModalOpen(true)} variant="outline" className="relative gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Cart ({getItemCount()})
                  {getItemCount() > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                      {getItemCount()}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="relative py-8 sm:py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            {filteredRentals && filteredRentals.length > 0 ? (
              <div className={getGridClasses()}>
                {filteredRentals.map((rental, index) => (
                  <AnimatedText key={rental.id} delay={index * 50}>
                    <Card
                      className={`group cursor-pointer border-border/50 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 hover:border-primary/20 ${viewMode === "list" ? "flex flex-col sm:flex-row h-auto" : "flex flex-col h-full"}`}
                      onClick={() => navigate(`/ecommerce/${rental.id}`)}
                    >
                      {/* Product Image */}
                      <div className={`relative ${viewMode === "list" ? "w-full sm:w-48 md:w-56 flex-shrink-0" : "w-full"}`}>
                        <ProductImageCarousel
                          images={rental.image_urls && rental.image_urls.length > 0 ? rental.image_urls : rental.image_url ? [rental.image_url] : []}
                          title={rental.title}
                          autoPlay={true}
                          interval={3000}
                        />
                        {/* Rating Badge */}
                        {rental.rating && rental.rating > 0 && viewMode !== "list" && (
                          <div className="absolute top-3 left-3">
                            <div className="flex items-center bg-background/90 dark:bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-xs font-semibold text-foreground">{rental.rating}</span>
                            </div>
                          </div>
                        )}
                        {/* Category Badge */}
                        {rental.categories && rental.categories.length > 0 && viewMode !== "list" && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="text-xs bg-background/90 dark:bg-background/80 backdrop-blur-sm text-foreground">
                              {rental.categories[0]}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className={`flex-1 flex flex-col ${viewMode === "list" ? "p-4 sm:p-6" : viewMode === "4" ? "p-2" : "p-3 sm:p-4"}`}>
                        {viewMode === "list" ? (
                          /* List View Layout */
                          <div className="flex flex-col h-full space-y-3">
                            <div className="space-y-2">
                              {rental.categories && rental.categories.length > 0 && (
                                <Badge variant="outline" className="text-xs w-fit">{rental.categories[0]}</Badge>
                              )}
                              <h3 className="text-lg md:text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
                                {rental.title}
                              </h3>
                            </div>
                            {rental.rating && rental.rating > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">{renderStars(Math.floor(rental.rating))}</div>
                                <span className="text-sm font-medium text-foreground">{rental.rating}</span>
                              </div>
                            )}
                            <p className="text-muted-foreground text-sm line-clamp-2 flex-1">
                              {rental.short_description || rental.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2 border-t border-border/50">
                              <div className="space-y-1">
                                {rental.price_range && (
                                  <div className="text-2xl font-bold text-primary">{rental.price_range}</div>
                                )}
                                <div className="text-sm text-muted-foreground">FREE delivery available</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(`/ecommerce/${rental.id}`); }}
                              >
                                <Eye className="h-4 w-4" />View Details
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Grid View Layout */
                          <>
                            <div className="flex-1">
                              <h3 className={`font-bold mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2 ${viewMode === "4" ? "text-sm" : "text-lg"}`}>
                                {rental.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                {rental.short_description || rental.description}
                              </p>
                              {rental.rating && rental.rating > 0 && (
                                <div className="flex items-center gap-1 mb-3">
                                  {renderStars(Math.floor(rental.rating))}
                                  <span className="text-xs text-muted-foreground ml-1">({rental.rating}/5)</span>
                                </div>
                              )}
                              {rental.price_range && (
                                <div className="mb-4">
                                  <Badge variant="outline" className="text-primary border-primary/30">{rental.price_range}</Badge>
                                </div>
                              )}
                            </div>
                            <div className="mt-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(`/ecommerce/${rental.id}`); }}
                              >
                                <Eye className="h-4 w-4" />View
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </AnimatedText>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Card className="border-border/50 max-w-md mx-auto">
                  <CardContent className="p-8">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2 text-foreground">No items found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search terms or filters.</p>
                    <Button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }} variant="outline">Clear Filters</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen} />
      </div>
    </Layout>
  );
};

export default EnhancedEcommerce;
