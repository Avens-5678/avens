import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useRentals } from "@/hooks/useData";
import { Package, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Ecommerce = () => {
  const { data: rentals, isLoading } = useRentals();
  const [selectedRental, setSelectedRental] = useState<string | null>(null);

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
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-accent"
                        onClick={() => setSelectedRental(rental.id)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Enquire Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <InquiryForm 
                        formType="rental"
                        rentalId={rental.id}
                        title="Rental Inquiry"
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Ecommerce;