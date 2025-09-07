import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import CartModal from "@/components/Cart/CartModal";
import { Package, ShoppingCart, Plus, Check, Grid2X2, Grid3X3, LayoutGrid, Search, List } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Ecommerce = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { items, addItem, isInCart } = useCart();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | '2' | '3' | '4'>('3');

  const viewOptions = [
    { 
      value: 'list' as const, 
      label: 'List', 
      icon: List, 
      classes: 'space-y-4 sm:space-y-6',
      isGrid: false
    },
    { 
      value: '2' as const, 
      label: '2 Col', 
      icon: Grid2X2, 
      classes: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
      isGrid: true
    },
    { 
      value: '3' as const, 
      label: '3 Col', 
      icon: Grid3X3, 
      classes: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
      isGrid: true
    },
    { 
      value: '4' as const, 
      label: '4 Col', 
      icon: LayoutGrid, 
      classes: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
      isGrid: true
    }
  ];

  const currentViewOption = viewOptions.find(option => option.value === viewMode) || viewOptions[2];
  const isListView = viewMode === 'list';

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-6 sm:px-8 lg:px-4 text-center">
          <Badge variant="secondary" className="mb-6">
            <Package className="mr-2 h-4 w-4" />
            Equipment Rental
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Premium Event Rentals
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Browse our extensive collection of high-quality equipment and decor for your special event.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-6 sm:px-8 lg:px-4">
          {/* View Options - Clear and Visible */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center justify-center">
              <div className="bg-background border border-border rounded-xl p-3 sm:p-4 shadow-lg w-full max-w-md">
                <h3 className="text-sm font-semibold text-center mb-4 px-2">View Options</h3>
                <RadioGroup 
                  value={viewMode} 
                  onValueChange={(value) => setViewMode(value as 'list' | '2' | '3' | '4')}
                  className="flex flex-wrap justify-center gap-3"
                >
                  {viewOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.value} className="flex items-center">
                        <RadioGroupItem 
                          value={option.value} 
                          id={option.value}
                          className="peer sr-only"
                        />
                        <Label 
                          htmlFor={option.value}
                          className={`
                            flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 min-w-[70px] justify-center
                            ${viewMode === option.value 
                              ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                              : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Search, Filter, and Cart Controls */}
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-4 items-stretch sm:items-center justify-between mb-8 sm:mb-10 relative z-10">
            {/* Left side: Search and Filter */}
            <div className="flex flex-col sm:flex-row flex-1 gap-4 items-stretch sm:items-center w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  className="w-full pl-10 pr-4 py-3 sm:py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-base"
                />
              </div>
              
              {/* Filter Dropdown */}
              <select className="px-4 py-3 sm:py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-base min-w-[120px]">
                <option value="all">All</option>
                <option value="furniture">Furniture</option>
                <option value="lighting">Lighting</option>
                <option value="audio">Audio/Visual</option>
                <option value="decor">Decor</option>
              </select>
            </div>
            
            {/* Right side: Cart */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Cart Button */}
              <Button
                onClick={() => setCartModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto py-3 sm:py-2"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart ({items.length})
              </Button>
            </div>
          </div>

          {/* Items Display with Dynamic Layout */}
          <div className={`${currentViewOption.classes} px-2 sm:px-0`}>
            {rentals?.map((rental) => (
              <Card key={rental.id} className={`group hover:shadow-xl transition-all duration-300 ${isListView ? "flex flex-col sm:flex-row" : ""}`}>
                {isListView ? (
                  <>
                    {/* List View Layout */}
                    <div className="w-full sm:w-48 flex-shrink-0 p-4 sm:p-4">
                      <div className="aspect-[4/3] overflow-hidden rounded-lg">
                        {rental.image_urls && rental.image_urls.length > 0 ? (
                          <MultiImageCarousel 
                            images={rental.image_urls} 
                            title={rental.title}
                          />
                        ) : rental.image_url ? (
                          <img 
                            src={rental.image_url} 
                            alt={rental.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6">
                      <div>
                        <CardTitle className="text-lg font-semibold group-hover:text-hover transition-colors mb-2">
                          {rental.title}
                        </CardTitle>
                        {rental.price_range && (
                          <p className="text-sm text-primary font-semibold mb-2">
                            {rental.price_range}
                          </p>
                        )}
                        <p className="text-muted-foreground text-sm">
                          {rental.short_description}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
                        <Button 
                          onClick={() => addItem({
                            id: rental.id,
                            title: rental.title,
                            price_range: rental.price_range,
                            image_url: rental.image_url
                          })}
                          variant={isInCart(rental.id) ? "secondary" : "outline"}
                          className="flex-1 py-2.5"
                          disabled={isInCart(rental.id)}
                        >
                          {isInCart(rental.id) ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="bg-gradient-to-r from-primary to-accent py-2.5"
                              onClick={() => setSelectedRental(rental)}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
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
                    </div>
                  </>
                ) : (
                  <>
                    {/* Grid View Layout */}
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold group-hover:text-hover transition-colors">
                        <div className="aspect-[4/3] mb-4 overflow-hidden rounded-lg">
                          {rental.image_urls && rental.image_urls.length > 0 ? (
                            <MultiImageCarousel 
                              images={rental.image_urls} 
                              title={rental.title}
                            />
                          ) : rental.image_url ? (
                            <img 
                              src={rental.image_url} 
                              alt={rental.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">No Image</span>
                            </div>
                          )}
                        </div>
                        {rental.title}
                      </CardTitle>
                      {rental.price_range && (
                        <p className="text-sm text-primary font-semibold">
                          {rental.price_range}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {rental.short_description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <Button 
                          onClick={() => addItem({
                            id: rental.id,
                            title: rental.title,
                            price_range: rental.price_range,
                            image_url: rental.image_url
                          })}
                          variant={isInCart(rental.id) ? "secondary" : "outline"}
                          className="flex-1 py-2.5"
                          disabled={isInCart(rental.id)}
                        >
                          {isInCart(rental.id) ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="bg-gradient-to-r from-primary to-accent py-2.5"
                              onClick={() => setSelectedRental(rental)}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
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
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Floating Cart Button */}
      {items.length > 0 && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button
            onClick={() => setCartModalOpen(true)}
            size="lg"
            className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-elegant hover:shadow-xl transition-all duration-300 animate-pulse"
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