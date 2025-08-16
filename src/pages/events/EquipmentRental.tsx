import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useRentals } from "@/hooks/useData";
import { Package, ArrowRight, Camera, ExternalLink, Settings, Truck, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import equipmentHero from "@/assets/equipment-rental-hero.jpg";

const EquipmentRental = () => {
  const { data: rentals, isLoading } = useRentals();
  const [selectedRental, setSelectedRental] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading rental services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const features = [
    {
      icon: Settings,
      title: "Professional Grade",
      description: "High-quality equipment for perfect event execution"
    },
    {
      icon: Truck,
      title: "Full Service",
      description: "Delivery, setup, and pickup included"
    },
    {
      icon: Shield,
      title: "Reliable Support",
      description: "24/7 technical support during your event"
    }
  ];

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${equipmentHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Package className="mr-2 h-4 w-4" />
              Equipment Rental
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Premium Event Equipment
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-xl">
              Professional-grade equipment rentals to make your event flawless
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Browse Equipment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/ecommerce">
                  View Catalog <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our Equipment Rental
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional equipment with full-service support for seamless events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Catalog */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Equipment Catalog
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade equipment for all your event needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals?.slice(0, 6).map((rental) => (
              <Card key={rental.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {rental.title}
                  </CardTitle>
                  {rental.price_range && (
                    <p className="text-sm text-primary font-semibold">
                      {rental.price_range}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {rental.short_description}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full"
                        onClick={() => setSelectedRental(rental.id)}
                      >
                        Enquire Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <InquiryForm 
                        formType="rental"
                        rentalId={rental.id}
                        title="Equipment Rental Inquiry"
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/ecommerce">
                View Full Catalog <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Need Custom Equipment Solutions?
              </h2>
              <p className="text-xl text-muted-foreground">
                Contact us for specialized equipment or bulk rental inquiries
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <InquiryForm 
                  formType="inquiry"
                  eventType="other"
                  title="Equipment Rental Inquiry"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EquipmentRental;