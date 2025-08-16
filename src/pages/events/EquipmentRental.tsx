import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useRentals, usePortfolio } from "@/hooks/useData";
import { Package, ArrowRight, Camera, ExternalLink, Settings, Truck, Shield, Monitor, Volume2, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import equipmentHero from "@/assets/equipment-rental-hero.jpg";

const EquipmentRental = () => {
  const { data: rentals, isLoading } = useRentals();
  const { data: portfolio } = usePortfolio();
  const [selectedRental, setSelectedRental] = useState<string | null>(null);

  const equipmentPortfolio = portfolio?.filter(item => 
    item.tag?.toLowerCase().includes('equipment') || 
    item.tag?.toLowerCase().includes('rental') ||
    item.tag?.toLowerCase().includes('audio') ||
    item.tag?.toLowerCase().includes('lighting')
  )?.slice(0, 3);

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

  const equipmentCategories = [
    {
      title: "Audio Systems",
      image: equipmentHero,
      description: "Professional sound equipment for crystal-clear audio"
    },
    {
      title: "Lighting & Visual", 
      image: equipmentHero,
      description: "Stunning lighting and projection equipment"
    },
    {
      title: "Staging & Decor",
      image: equipmentHero, 
      description: "Professional staging and decorative elements"
    }
  ];

  return (
    <Layout>
      {/* Lifestyle Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Content Side */}
            <div className="lg:w-1/2 space-y-8">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 w-fit">
                <Package className="mr-2 h-4 w-4" />
                Equipment Rental
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Professional Grade
                  <span className="block text-primary">Event Equipment</span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  At Avens Events, we provide top-tier professional equipment rentals with full-service support. From audio-visual systems to staging and lighting, we ensure your event has the technical excellence it deserves.
                </p>
              </div>

              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8">
                Browse Equipment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Image Side */}
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src={equipmentHero}
                  alt="Professional event equipment setup"
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full opacity-20"></div>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-full opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold">What We Do</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At Avens Events, we provide professional-grade equipment rentals with comprehensive support services. From delivery and setup to 24/7 technical support, 
              we ensure your event runs flawlessly with the highest quality equipment.
            </p>
          </div>

          {/* Equipment Categories */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold mb-2">Our Equipment Categories</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {equipmentCategories.map((category, index) => (
                <Card key={index} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <CardContent className="p-6 text-center bg-background">
                    <h4 className="text-xl font-semibold mb-3">{category.title}</h4>
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Services */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start gap-16">
            {/* Curved Text Title */}
            <div className="lg:w-1/3">
              <div className="relative">
                <div className="transform -rotate-12 origin-left">
                  <h2 className="text-4xl lg:text-5xl font-bold text-primary leading-tight">
                    Equipment
                    <br />
                    Services
                  </h2>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Professional Audio Systems</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Lighting & Visual Effects</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Staging & Platforms</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Power & Infrastructure</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Delivery & Setup</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">24/7 Technical Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Event Day Operation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">& So Much More</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Process</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Monitor className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 1: Consultation</h3>
              <p className="text-muted-foreground leading-relaxed">
                We assess your event needs, venue requirements, and technical specifications to recommend the perfect equipment package for your occasion.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Volume2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 2: Setup & Testing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our professional technicians deliver, install, and thoroughly test all equipment to ensure everything is working perfectly for your event.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 3: Event Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                We provide on-site technical support during your event and handle the complete breakdown and pickup once your celebration concludes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      {equipmentPortfolio && equipmentPortfolio.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Equipment Gallery
              </h2>
              <p className="text-xl text-muted-foreground">
                See our professional equipment in action at events
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {equipmentPortfolio.map((item) => (
                <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-500">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                    {item.tag && (
                      <Badge variant="secondary" className="text-xs">
                        {item.tag}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg" asChild>
                <Link to="/portfolio">
                  View All Equipment Setups <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Equipment Catalog Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Equipment
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our selection of professional-grade equipment
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
                        Get Quote <ArrowRight className="ml-2 h-4 w-4" />
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
                View Complete Catalog <ExternalLink className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Elevate Your
              <span className="block text-primary">Event Technology?</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Whether you need basic audio support or a complete technical production, our professional equipment and expert technicians ensure your event sounds amazing and looks spectacular.
            </p>

            <div className="pt-6">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 text-lg">
                Get Equipment Quote
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EquipmentRental;