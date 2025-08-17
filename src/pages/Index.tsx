import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Layout from "@/components/Layout/Layout";
import { useHeroBanners, useServices, useRentals, useTrustedClients, useNewsAchievements } from "@/hooks/useData";
import { ArrowRight, Sparkles, Clock, Users, Award, CheckCircle, Star, Trophy, Heart } from "lucide-react";
import InquiryForm from "@/components/Forms/InquiryForm";
import Autoplay from "embla-carousel-autoplay";
import { HeroSection as HeroContainer } from "@/components/ui/hero-section";
import { AnimatedText } from "@/components/ui/animated-text";

// A reusable skeleton component for card-based layouts
const CardSkeleton = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-muted/40 rounded w-3/4"></div>
        <div className="h-3 bg-muted/40 rounded w-full"></div>
        <div className="h-3 bg-muted/40 rounded w-5/6"></div>
        <div className="h-10 bg-muted/40 rounded-2xl mt-4"></div>
    </div>
);


const Index = () => {
  const { data: heroBanners, isLoading: loadingBanners } = useHeroBanners();
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: rentals, isLoading: loadingRentals } = useRentals();
  const { data: trustedClients, isLoading: loadingClients } = useTrustedClients();
  const { data: newsAchievements, isLoading: loadingNews } = useNewsAchievements();
  const [selectedRental, setSelectedRental] = useState < string | null > (null);

  // [REMOVED] The useEffect for hiding arrows has been deleted in favor of a pure CSS solution.

  return (
    <Layout>
      {/* Hero Section with Carousel */}
      <HeroContainer className="relative">
        {loadingBanners ? (
            // [ADDED] Skeleton loader for the hero section
            <div className="h-screen flex items-center justify-center bg-muted/40">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading amazing content...</p>
                </div>
            </div>
        ) : heroBanners && heroBanners.length > 0 ? (
          <Carousel
            // [CHANGED] Added 'hero-container' class to enable the CSS hover effect for arrows
            className="w-full h-screen relative hero-container"
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
                      <AnimatedText className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        {banner.title}
                      </AnimatedText>
                      {banner.subtitle && (
                        <AnimatedText delay={300} className="text-xl md:text-2xl mb-8 text-white/90">
                          {banner.subtitle}
                        </AnimatedText>
                      )}
                      <AnimatedText delay={600}>
                        <Button
                          asChild
                          size="lg"
                          className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300 text-lg px-8 py-3 rounded-2xl"
                        >
                          <Link to={`/events/${banner.event_type}`}>
                            {banner.button_text} <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </AnimatedText>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* These arrows are now controlled by CSS */}
            <CarouselPrevious className="hero-arrow left-4 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all duration-300" />
            <CarouselNext className="hero-arrow right-4 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all duration-300" />
          </Carousel>
        ) : (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center max-w-4xl mx-auto px-4">
                <AnimatedText className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Creating Unforgettable Moments
                </AnimatedText>
                <AnimatedText delay={300} className="text-xl md:text-2xl mb-8 text-muted-foreground">
                    Premium event management and rental services for your special occasions
                </AnimatedText>
                <AnimatedText delay={600}>
                    <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300 text-lg px-8 py-3 rounded-2xl"
                    >
                    <Link to="/services">
                        Explore Services <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    </Button>
                </AnimatedText>
                </div>
            </div>
        )}
      </HeroContainer>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
        {/* ... stats JSX remains the same as it's static ... */}
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">{/* ... Section header JSX ... */}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingServices ? (
                // [ADDED] Skeleton loaders for services
                [...Array(3)].map((_, i) => <CardSkeleton key={i} />)
            ) : (
              services?.map((service, index) => (
                <AnimatedText key={service.id} delay={600 + index * 100}>
                  <Card className="group hover:shadow-xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-sm hover:-translate-y-2 rounded-3xl overflow-hidden">
                    {/* ... Service card content from original file ... */}
                  </Card>
                </AnimatedText>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Rentals Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">{/* ... Section header JSX ... */}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingRentals ? (
                    // [ADDED] Skeleton loaders for rentals
                    [...Array(3)].map((_, i) => <CardSkeleton key={i} />)
                ) : (
                    rentals?.map((rental, index) => (
                        <AnimatedText key={rental.id} delay={600 + index * 100}>
                            <Card className="group hover:shadow-xl transition-all duration-500 bg-white/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden hover:-translate-y-2">
                                {/* ... Rental card content with Dialog from original file ... */}
                            </Card>
                        </AnimatedText>
                    ))
                )}
            </div>
            {/* ... View All Rentals button ... */}
        </div>
      </section>

      {/* ... Other sections (TrustedClients, News & Achievements, Contact) would follow the same pattern ... */}
      {/* For each section, wrap the .map() in a check for its specific loading state */}
      {/* Example for Trusted Clients: */}
      {loadingClients ? (
          <div className="py-20 container mx-auto text-center">Loading Clients...</div>
      ) : (
          trustedClients && trustedClients.length > 0 && (
              <section className="py-20">
                  {/* ... Trusted Clients JSX ... */}
              </section>
          )
      )}
    </Layout>
  );
};

export default Index;