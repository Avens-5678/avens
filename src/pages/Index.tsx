import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useHeroBanners, useServices, useRentals, useTrustedClients, useNewsAchievements } from "@/hooks/useData";
import { ArrowRight, Sparkles, Clock, Users, Award, CheckCircle, Star, Trophy, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import InquiryForm from "@/components/Forms/InquiryForm";
import Autoplay from "embla-carousel-autoplay";
import { HeroSection } from "@/components/ui/hero-section";
import { AnimatedText } from "@/components/ui/animated-text";

const Index = () => {
  const { data: heroBanners, isLoading: loadingBanners } = useHeroBanners();
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: rentals, isLoading: loadingRentals } = useRentals();
  const { data: trustedClients, isLoading: loadingClients } = useTrustedClients();
  const { data: newsAchievements, isLoading: loadingNews } = useNewsAchievements();
  const [selectedRental, setSelectedRental] = useState<string | null>(null);

  // Auto-hide arrows after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const arrows = document.querySelectorAll('.hero-arrow');
      arrows.forEach(arrow => {
        arrow.classList.add('opacity-0', 'pointer-events-none');
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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
      <HeroSection className="relative">
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
            {/* Auto-hiding transparent arrows */}
            <CarouselPrevious className="hero-arrow left-4 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all duration-300 opacity-100 animate-fade-in-delay" />
            <CarouselNext className="hero-arrow right-4 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all duration-300 opacity-100 animate-fade-in-delay" />
          </Carousel>
        ) : (
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
        )}
      </HeroSection>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <AnimatedText delay={200} className="text-center group">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-2xl mb-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground">100+</div>
                <div className="text-sm text-muted-foreground">Happy Clients</div>
              </div>
            </AnimatedText>
            <AnimatedText delay={300} className="text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-secondary/10 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-secondary to-hover rounded-2xl mb-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Events Completed</div>
              </div>
            </AnimatedText>
            <AnimatedText delay={400} className="text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-2xl mb-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-muted-foreground">Rating Average</div>
              </div>
            </AnimatedText>
            <AnimatedText delay={500} className="text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-secondary/10 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-secondary to-hover rounded-2xl mb-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground">15+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
            </AnimatedText>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <AnimatedText>
              <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                <Sparkles className="mr-2 h-4 w-4" />
                Our Services
              </Badge>
            </AnimatedText>
            <AnimatedText delay={200}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Exceptional Event Services
              </h2>
            </AnimatedText>
            <AnimatedText delay={400}>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From intimate gatherings to grand celebrations, we bring your vision to life
              </p>
            </AnimatedText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service, index) => (
              <AnimatedText key={service.id} delay={600 + index * 100}>
                <Card className="group hover:shadow-xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-sm hover:-translate-y-2 rounded-3xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:animate-pulse"></div>
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                      {service.short_description}
                    </p>
                    <Button 
                      asChild
                      variant="ghost"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 rounded-2xl border-2 border-transparent group-hover:border-primary/20"
                    >
                      <Link to={`/events/${service.event_type}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedText>
            ))}
          </div>
        </div>
      </section>

      {/* Rentals Section */}
      <section className="py-20 relative">
        {/* Organic background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-64 bg-gradient-to-tr from-secondary/10 to-transparent rounded-[100px] blur-2xl rotate-45"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <AnimatedText>
              <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                <Clock className="mr-2 h-4 w-4" />
                Equipment Rental
              </Badge>
            </AnimatedText>
            <AnimatedText delay={200}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Premium Event Rentals
              </h2>
            </AnimatedText>
            <AnimatedText delay={400}>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                High-quality equipment and decor to make your event perfect
              </p>
            </AnimatedText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals?.map((rental, index) => (
              <AnimatedText key={rental.id} delay={600 + index * 100}>
                <Card className="group hover:shadow-xl transition-all duration-500 bg-white/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden hover:-translate-y-2">
                  {/* Decorative top border with gradient */}
                  <div className="h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                  
                  <CardHeader className="relative">
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold pr-12">
                      {rental.title}
                    </CardTitle>
                    {rental.price_range && (
                      <div className="inline-flex items-center bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-full px-3 py-1 w-fit">
                        <p className="text-sm text-secondary font-semibold">
                          $100-500 per event
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {rental.short_description}
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
                          onClick={() => setSelectedRental(rental.id)}
                        >
                          Enquire Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md rounded-3xl">
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
              </AnimatedText>
            ))}
          </div>

          <AnimatedText delay={1000} className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="rounded-2xl border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              <Link to="/ecommerce">
                View All Rentals <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </AnimatedText>
        </div>
      </section>

      {/* Trusted Clients */}
      {trustedClients && trustedClients.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-muted/30 to-background relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-[50%] blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-40 bg-secondary/5 rounded-[80px] blur-3xl rotate-12"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <AnimatedText>
                <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                  <Users className="mr-2 h-4 w-4" />
                  Trusted By
                </Badge>
              </AnimatedText>
              <AnimatedText delay={200}>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Our Valued Clients
                </h2>
              </AnimatedText>
            </div>

            <AnimatedText delay={400}>
              <div className="overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm border border-white/20 py-8">
                <div className="flex animate-scroll space-x-12">
                  {[...trustedClients, ...trustedClients].map((client, index) => (
                    <div 
                      key={`${client.id}-${index}`}
                      className="flex-shrink-0 h-16 w-32 flex items-center justify-center group"
                    >
                      <img 
                        src={client.logo_url} 
                        alt={client.name}
                        className="max-h-full max-w-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedText>
          </div>
        </section>
      )}

      {/* News & Achievements - Creative Design */}
      {newsAchievements && newsAchievements.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background relative overflow-hidden">
          {/* Organic Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-[50%] blur-3xl rotate-12"></div>
            <div className="absolute bottom-20 right-10 w-96 h-64 bg-gradient-to-tl from-secondary/20 to-transparent rounded-[100px] blur-3xl -rotate-12"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-primary/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <AnimatedText>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary via-primary-glow to-secondary rounded-3xl mb-6 shadow-glow">
                  <Award className="h-10 w-10 text-white" />
                </div>
              </AnimatedText>
              <AnimatedText delay={200}>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  News & Achievements
                </h2>
              </AnimatedText>
              <AnimatedText delay={400}>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Celebrating our journey of success and recognition
                </p>
              </AnimatedText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {newsAchievements.map((news, index) => (
                <AnimatedText key={news.id} delay={600 + index * 200}>
                  <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden hover:-translate-y-2 ${
                    index % 2 === 0 ? 'md:translate-y-8' : ''
                  }`}>
                    {/* Decorative top accent */}
                    <div className="h-2 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                    
                    {news.image_url && (
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                        <img 
                          src={news.image_url} 
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Floating badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 z-20">
                          <span className="text-xs font-semibold text-primary">Featured</span>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                        {news.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {news.short_content}
                      </p>
                      <div className="flex items-center text-sm font-medium">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full mr-3"></div>
                        <span className="text-primary">Achievement Unlocked</span>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedText>
              ))}
            </div>

            <AnimatedText delay={1200} className="text-center">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300 text-lg px-8 py-3 rounded-2xl"
              >
                <Link to="/about">
                  Discover Our Story <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </AnimatedText>
          </div>
        </section>
      )}

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-background relative overflow-hidden">
        {/* Dynamic background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-primary/10 to-transparent rounded-[60%] blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-64 bg-gradient-to-tl from-secondary/10 to-transparent rounded-[100px] blur-3xl rotate-45"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <AnimatedText>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Get In Touch
              </h2>
            </AnimatedText>
            <AnimatedText delay={200}>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ready to create your perfect event? Let's start planning together.
              </p>
            </AnimatedText>
          </div>
          
          <AnimatedText delay={400} className="flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-8 py-4 text-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  Contact Us <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-3xl">
                <DialogTitle>Contact Us</DialogTitle>
                <DialogDescription>Get in touch with us for your event planning needs</DialogDescription>
                <InquiryForm 
                  formType="contact"
                  title="Contact Us"
                />
              </DialogContent>
            </Dialog>
          </AnimatedText>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
