import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useHeroBanners, useServices, useRentals, useTrustedClients, useNewsAchievements } from "@/hooks/useData";
import { ArrowRight, Sparkles, Clock, Users, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import InquiryForm from "@/components/Forms/InquiryForm";
import Autoplay from "embla-carousel-autoplay";

const Index = () => {
  const { data: heroBanners, isLoading: loadingBanners } = useHeroBanners();
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: rentals, isLoading: loadingRentals } = useRentals();
  const { data: trustedClients, isLoading: loadingClients } = useTrustedClients();
  const { data: newsAchievements, isLoading: loadingNews } = useNewsAchievements();
  const [selectedRental, setSelectedRental] = useState<string | null>(null);

  if (loadingBanners || loadingServices || loadingRentals || loadingClients || loadingNews) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading amazing content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section with Carousel */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
        
        {heroBanners && heroBanners.length > 0 ? (
          <Carousel 
            className="w-full h-screen relative"
            plugins={[
              Autoplay({
                delay: 15000,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {heroBanners.map((banner) => (
                <CarouselItem key={banner.id} className="relative">
                  <div 
                    className="h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
                    style={{ backgroundImage: `url(${banner.image_url})` }}
                  >
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        {banner.title}
                      </h1>
                      {banner.subtitle && (
                        <p className="text-xl md:text-2xl mb-8 text-white/90">
                          {banner.subtitle}
                        </p>
                      )}
                      <Button 
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300 text-lg px-8 py-3"
                      >
                        <Link to={`/events/${banner.event_type}`}>
                          {banner.button_text} <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        ) : (
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Creating Unforgettable Moments
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              Premium event management and rental services for your special occasions
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300 text-lg px-8 py-3"
            >
              <Link to="/services">
                Explore Services <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-2 h-4 w-4" />
              Our Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Exceptional Event Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From intimate gatherings to grand celebrations, we bring your vision to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service) => (
              <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-background">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {service.short_description}
                  </p>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  >
                    <Link to={`/events/${service.event_type}`}>
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rentals Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Clock className="mr-2 h-4 w-4" />
              Equipment Rental
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Premium Event Rentals
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              High-quality equipment and decor to make your event perfect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals?.map((rental) => (
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
                        Enquire Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogTitle className="sr-only">Rental Inquiry</DialogTitle>
                      <DialogDescription className="sr-only">Submit an inquiry for equipment rental</DialogDescription>
                      <InquiryForm 
                        formType="rental"
                        rentalId={rental.id}
                        rentalTitle={rental.title}
                        title="Rental Inquiry"
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
                View All Rentals <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trusted Clients */}
      {trustedClients && trustedClients.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Users className="mr-2 h-4 w-4" />
                Trusted By
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Valued Clients
              </h2>
            </div>

            <div className="overflow-hidden">
              <div className="flex animate-scroll space-x-12">
                {[...trustedClients, ...trustedClients].map((client, index) => (
                  <div 
                    key={`${client.id}-${index}`}
                    className="flex-shrink-0 h-16 w-32 flex items-center justify-center"
                  >
                    <img 
                      src={client.logo_url} 
                      alt={client.name}
                      className="max-h-full max-w-full object-contain opacity-60 hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* News & Achievements - Creative Design */}
      {newsAchievements && newsAchievements.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-background relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                News & Achievements
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Celebrating our journey of success and recognition
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {newsAchievements.map((news, index) => (
                <Card key={news.id} className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-background/80 backdrop-blur-sm ${
                  index % 2 === 0 ? 'md:translate-y-8' : ''
                }`}>
                  {news.image_url && (
                    <div className="aspect-[16/10] overflow-hidden rounded-t-xl relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                      <img 
                        src={news.image_url} 
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                      {news.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {news.short_content}
                    </p>
                    <div className="flex items-center text-sm text-accent font-medium">
                      <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent mr-3"></div>
                      Achievement Unlocked
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300 text-lg px-8 py-3"
              >
                <Link to="/about">
                  Discover Our Story <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Get In Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to create your perfect event? Let's start planning together.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 text-lg">
                  Contact Us
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogTitle>Contact Us</DialogTitle>
                <DialogDescription>Get in touch with us for your event planning needs</DialogDescription>
                <InquiryForm 
                  formType="contact"
                  title="Contact Us"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
