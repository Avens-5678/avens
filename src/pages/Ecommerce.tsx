import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import CartModal from "@/components/Cart/CartModal";
import { Package, ShoppingCart, Plus, Check, Grid2X2, Grid3X3, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";

const Ecommerce = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { items, addItem, isInCart } = useCart();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [gridView, setGridView] = useState<'2' | '3' | '4'>('3');

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

          {/* Items Grid with Dynamic Layout */}
          <div className={`grid ${currentGridClasses} gap-6`}>
            {rentals?.map((rental) => (
              <Card key={rental.id} className="group hover:shadow-xl transition-all duration-300">
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
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Floating Grid Toggle and Cart Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Grid View Selector */}
        <div className="flex items-center gap-1 bg-white border-2 border-gray-400 rounded-lg p-2 shadow-lg">
          {gridOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={gridView === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setGridView(option.value)}
                className="h-10 px-3 transition-all duration-200 text-gray-800 hover:text-gray-900 border-gray-300"
                title={option.label}
              >
                <Icon className="h-4 w-4" />
                <span className="ml-1 text-xs hidden sm:inline font-medium">{option.value}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Cart Button */}
        {items.length > 0 && (
          <Button
            onClick={() => setCartModalOpen(true)}
            size="lg"
            className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart ({items.length})
          </Button>
        )}
      </div>
      
      <CartModal 
        open={cartModalOpen} 
        onOpenChange={setCartModalOpen} 
      />
    </Layout>
  );
};

export default Ecommerce;