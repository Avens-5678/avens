import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Search, ShoppingCart, Plus, Minus, Star, Filter, Eye, Grid3X3, Grid2X2, Columns2, Rows3 } from "lucide-react";
import { AnimatedViewToggle } from "@/components/ui/animated-view-toggle";
import Layout from "@/components/Layout/Layout";
import { AnimatedText } from "@/components/ui/animated-text";
import InquiryForm from "@/components/Forms/InquiryForm";
import CartModal from "@/components/Cart/CartModal";
import { ProductImageCarousel } from "@/components/ui/product-image-carousel";

const EnhancedEcommerce = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState("3");
  
  const { data: rentals, isLoading } = useAllRentals();
  const { items, addItem, removeItem, getItemCount } = useCart();
  const { toast } = useToast();

  // Extract unique categories from rentals
  const categories = useMemo(() => {
    if (!rentals) return ["All"];
    const uniqueCategories = Array.from(new Set(
      rentals.flatMap(rental => rental.categories || [])
    ));
    return ["All", ...uniqueCategories];
  }, [rentals]);

  // Filter rentals based on search and category
  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    
    return rentals.filter(rental => {
      const matchesSearch = rental.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rental.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (rental.search_keywords && rental.search_keywords.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || 
                            (rental.categories && rental.categories.includes(selectedCategory));
      
      return matchesSearch && matchesCategory && rental.is_active;
    });
  }, [rentals, searchTerm, selectedCategory]);

  const handleQuantityChange = (rentalId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [rentalId]: Math.max(1, (prev[rentalId] || 1) + change)
    }));
  };

  const handleAddToCart = (rental: any) => {
    const quantity = quantities[rental.id] || 1;
    addItem({ ...rental, quantity });
    toast({
      title: "Added to Cart",
      description: `${rental.title} (${quantity}) added to your rental cart.`,
    });
  };

  const isInCart = (rentalId: string) => {
    return items.some(item => item.id === rentalId);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  // View toggle options
  const viewOptions = [
    { value: "list", label: "List", icon: Rows3 },
    { value: "2", label: "2 Cols", icon: Columns2 },
    { value: "3", label: "3 Cols", icon: Grid2X2 },
    { value: "4", label: "4 Cols", icon: Grid3X3 }
  ];

  // Dynamic grid classes based on view mode
  const getGridClasses = () => {
    switch (viewMode) {
      case "list":
        return "grid-cols-1";
      case "2":
        return "grid-cols-1 lg:grid-cols-2";
      case "3":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "4":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-primary/5">
        {/* Header Section */}
        <section className="relative py-20 lg:py-28">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <AnimatedText>
                <Badge variant="secondary" className="mb-6 rounded-full px-6 py-2">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Equipment Rental
                </Badge>
              </AnimatedText>
              
              <AnimatedText delay={200}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                  Premium Rental Collection
                </h1>
              </AnimatedText>
              
              <AnimatedText delay={400}>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                  Discover our extensive collection of high-quality equipment and furniture for your events.
                </p>
              </AnimatedText>
            </div>

            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto mb-12">
              <Card className="glassmorphism-card border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Top Row: Search and Cart */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                      {/* Search Input */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search equipment, furniture, or services..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12 text-lg border-0 bg-muted/50 focus:bg-background"
                        />
                      </div>

                      {/* Cart Button - Always visible, positioned top-right */}
                      <Button
                        onClick={() => setCartModalOpen(true)}
                        className="relative bg-primary hover:bg-primary-glow shadow-glow-blue min-w-[120px]"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Cart ({getItemCount()})
                        {getItemCount() > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {getItemCount()}
                          </div>
                        )}
                      </Button>
                    </div>

                    {/* Bottom Row: Category Filter and View Toggle */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      {/* Category Filter */}
                      <div className="flex items-center gap-3">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-48 h-12 border-0 bg-muted/50">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* View Toggle */}
                      <AnimatedViewToggle
                        options={viewOptions}
                        value={viewMode}
                        onValueChange={setViewMode}
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="relative py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            {filteredRentals && filteredRentals.length > 0 ? (
              <div className={`grid ${getGridClasses()} gap-6`}>
                 {filteredRentals.map((rental, index) => (
                   <AnimatedText key={rental.id} delay={index * 50}>
                     <Card className={`group hover:shadow-2xl transition-all duration-500 glassmorphism-card border-0 overflow-hidden hover:-translate-y-2 h-full ${
                       viewMode === "list" ? "flex flex-row" : ""
                     }`}>
                       {/* Product Image Carousel */}
                       <div className={`relative ${viewMode === "list" ? "w-80 flex-shrink-0" : ""}`}>
                         <ProductImageCarousel
                           images={rental.image_urls && rental.image_urls.length > 0 
                             ? rental.image_urls 
                             : rental.image_url ? [rental.image_url] : []
                           }
                           title={rental.title}
                           autoPlay={true}
                           interval={3000}
                         />
                         
                         {/* Rating Badge */}
                         {rental.rating && rental.rating > 0 && (
                           <div className="absolute top-3 left-3">
                             <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                               <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                               <span className="text-xs font-semibold">{rental.rating}</span>
                             </div>
                           </div>
                         )}

                         {/* Category Badge */}
                         {rental.categories && rental.categories.length > 0 && (
                           <div className="absolute top-3 right-3">
                             <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
                               {rental.categories[0]}
                             </Badge>
                           </div>
                         )}
                       </div>

                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {rental.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {rental.short_description || rental.description}
                          </p>

                          {/* Rating Stars */}
                          {rental.rating && rental.rating > 0 && (
                            <div className="flex items-center gap-1 mb-3">
                              {renderStars(Math.floor(rental.rating))}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({rental.rating}/5)
                              </span>
                            </div>
                          )}

                          {/* Price Range */}
                          {rental.price_range && (
                            <div className="mb-4">
                              <Badge variant="outline" className="text-primary border-primary/30">
                                {rental.price_range}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Quantity Selector and Actions */}
                        <div className="space-y-3 mt-auto">
                          {/* Quantity Selector */}
                          <div className="flex items-center justify-center space-x-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(rental.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-semibold">
                              {quantities[rental.id] || 1}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(rental.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddToCart(rental)}
                              className={`flex-1 ${
                                isInCart(rental.id)
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-primary hover:bg-primary-glow'
                              } transition-all duration-300`}
                              size="sm"
                            >
                              <ShoppingCart className="mr-2 h-3 w-3" />
                              {isInCart(rental.id) ? 'In Cart' : 'Add to Cart'}
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="px-3">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Inquire About {rental.title}</DialogTitle>
                                </DialogHeader>
                                <InquiryForm
                                  formType="rental"
                                  rentalId={rental.id}
                                  rentalTitle={rental.title}
                                  title="Get Rental Quote"
                                />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedText>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Card className="glassmorphism-card border-0 shadow-xl max-w-md mx-auto">
                  <CardContent className="p-8">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No items found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search terms or filters.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("All");
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>


        {/* Cart Modal */}
        <CartModal 
          open={cartModalOpen} 
          onOpenChange={setCartModalOpen} 
        />
      </div>
    </Layout>
  );
};

export default EnhancedEcommerce;