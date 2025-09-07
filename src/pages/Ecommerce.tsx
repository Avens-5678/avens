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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Ecommerce = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { items, addItem, isInCart } = useCart();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [gridView, setGridView] = useState<'2' | '3' | '4'>('3');
  const [isListView, setIsListView] = useState(false);

  const gridOptions = [
    { 
      value: '2' as const, 
      label: '2 Columns', 
      icon: Grid2X2, 
      classes: 'grid-cols-1 sm:grid-cols-2'
    },
    { 
      value: '3' as const, 
      label: '3 Columns', 
      icon: Grid3X3, 
      classes: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    },
    { 
      value: '4' as const, 
      label: '4 Columns', 
      icon: LayoutGrid, 
      classes: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }
  ];

  const currentGridClasses = gridOptions.find(option => option.value === gridView)?.classes || gridOptions[1].classes;

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
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Package className="mr-2 h-4 w-4" />
            Equipment Rental
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Premium Event Rentals
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse our extensive collection of high-quality equipment and decor for your special event.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* View Toggle - Fixed positioning with high z-index */}
          <div className="sticky top-4 z-30 mb-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4 bg-background/95 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                <Grid3X3 className={`h-5 w-5 transition-colors ${!isListView ? 'text-primary' : 'text-muted-foreground'}`} />
                <Switch
                  id="view-mode"
                  checked={isListView}
                  onCheckedChange={setIsListView}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted scale-150"
                />
                <List className={`h-5 w-5 transition-colors ${isListView ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label htmlFor="view-mode" className="text-sm font-semibold cursor-pointer text-foreground">
                  {isListView ? 'List View' : 'Grid View'}
                </Label>
              </div>
            </div>
          </div>

          {/* Search, Filter, and Cart Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 relative z-10">
            {/* Left side: Search and Filter */}
            <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search equipment, furniture, or services..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>
              
              {/* Filter Dropdown */}
              <select className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">All</option>
                <option value="furniture">Furniture</option>
                <option value="lighting">Lighting</option>
                <option value="audio">Audio/Visual</option>
                <option value="decor">Decor</option>
              </select>
            </div>
            
            {/* Right side: Grid Controls and Cart */}
            <div className="flex items-center gap-4">

              {/* Grid Column Options (only show when not in list view) */}
              {!isListView && (
                <div className="flex items-center gap-1 bg-background border rounded-lg p-2">
                  {gridOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={option.value}
                        variant={gridView === option.value ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setGridView(option.value)}
                        className="h-8 px-2"
                        title={option.label}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    );
                  })}
                </div>
              )}
              
              {/* Cart Button */}
              <Button
                onClick={() => setCartModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart ({items.length})
              </Button>
            </div>
          </div>

          {/* Items Display with Dynamic Layout */}
          <div className={isListView ? "space-y-4" : `grid ${currentGridClasses} gap-6`}>
            {rentals?.map((rental) => (
              <Card key={rental.id} className={`group hover:shadow-xl transition-all duration-300 ${isListView ? "flex flex-row" : ""}`}>
                {isListView ? (
                  <>
                    {/* List View Layout */}
                    <div className="w-48 flex-shrink-0 p-4">
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
                    <div className="flex-1 flex flex-col justify-between p-6">
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
                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={() => addItem({
                            id: rental.id,
                            title: rental.title,
                            price_range: rental.price_range,
                            image_url: rental.image_url
                          })}
                          variant={isInCart(rental.id) ? "secondary" : "outline"}
                          className="flex-1"
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
                              className="bg-gradient-to-r from-primary to-accent"
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
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => addItem({
                            id: rental.id,
                            title: rental.title,
                            price_range: rental.price_range,
                            image_url: rental.image_url
                          })}
                          variant={isInCart(rental.id) ? "secondary" : "outline"}
                          className="flex-1"
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
                              className="bg-gradient-to-r from-primary to-accent"
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
        <div className="fixed bottom-6 right-6 z-50">
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