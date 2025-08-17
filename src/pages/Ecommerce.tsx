import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useAllRentals } from "@/hooks/useData";
import { useCart } from "@/hooks/useCart";
import CartModal from "@/components/Cart/CartModal";
import { Package, ShoppingCart, Plus, Check } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Ecommerce = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { items, addItem, isInCart } = useCart();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rentals?.map((rental) => (
              <Card key={rental.id} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold group-hover:text-hover transition-colors">
            <div className="aspect-[4/3] mb-4 overflow-hidden rounded-lg">
              {rental.image_url ? (
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
                      <DialogContent className="max-w-md">
                        <InquiryForm 
                          formType="rental"
                          rentalId={selectedRental?.id}
                          rentalTitle={selectedRental?.title}
                          title="Rental Inquiry"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
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
            className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
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