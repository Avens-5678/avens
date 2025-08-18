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
import { AnimatedText, GradientText } from "@/components/ui/animated-text";
import TestimonialsSection from "@/components/TestimonialsSection";
const Index = () => {
  const {
    data: heroBanners,
    isLoading: loadingBanners
  } = useHeroBanners();
  const {
    data: services,
    isLoading: loadingServices
  } = useServices();
  const {
    data: rentals,
    isLoading: loadingRentals
  } = useRentals();
  const {
    data: trustedClients,
    isLoading: loadingClients
  } = useTrustedClients();
  const {
    data: newsAchievements,
    isLoading: loadingNews
  } = useNewsAchievements();
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
    return <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading amazing content...</p>
          </div>
        </div>
      </Layout>;
  }
  return <Layout>
      {/* Unified gradient background for entire homepage */}
      <div className="bg-gradient-to-b from-background via-muted/10 via-background/80 to-primary/5 min-h-screen">
        {/* Hero Section with Carousel */}
        <div className="relative">
          {heroBanners && heroBanners.length > 0 ? <Carousel className="w-full h-screen relative" plugins={[Autoplay({
          delay: 15000
        })]} opts={{
          align: "start",
          loop: true
        }}>
              <CarouselContent>
                {heroBanners.map(banner => <CarouselItem key={banner.id} className="relative">
                    <div className="h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" style={{
                backgroundImage: `url(${banner.image_url})`
              }}>
                      <div className="absolute inset-0 bg-black/40"></div>
                      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                        <AnimatedText variant="fade-in-up" className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                          <GradientText variant="primary">{banner.title}</GradientText>
                        </AnimatedText>
                        {banner.subtitle && <AnimatedText variant="fade-in-up" delay={300} className="text-lg md:text-xl mb-6 text-white/90">
                            {banner.subtitle}
                          </AnimatedText>}
                        <AnimatedText variant="scale-in" delay={600}>
                          <Button asChild size="lg" className="glassmorphism-btn text-lg px-8 py-3 rounded-2xl">
                            <Link to={`/events/${banner.event_type}`}>
                              {banner.button_text} <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </AnimatedText>
                      </div>
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
              {/* Auto-hiding transparent arrows */}
              <CarouselPrevious className="hero-arrow left-4 bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-md transition-all duration-300 opacity-100 animate-fade-in-delay hidden md:flex" />
              <CarouselNext className="hero-arrow right-4 bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-md transition-all duration-300 opacity-100 animate-fade-in-delay hidden md:flex" />
            </Carousel> : <div className="h-screen flex items-center justify-center text-center max-w-4xl mx-auto px-4">
              <div>
                <AnimatedText variant="fade-in-up" className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  <GradientText>Creating Unforgettable</GradientText><br />
                  <GradientText variant="secondary">Moments</GradientText>
                </AnimatedText>
                <AnimatedText variant="fade-in-up" delay={300} className="text-lg md:text-xl mb-6 text-muted-foreground">
                  Premium event management and rental services for your special occasions
                </AnimatedText>
                <AnimatedText variant="scale-in" delay={600}>
                  <Button asChild size="lg" className="glassmorphism-btn text-lg px-8 py-3 rounded-2xl">
                    <Link to="/services">
                      Explore Services <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </AnimatedText>
              </div>
            </div>}
        </div>

        {/* Stats Section */}
        <section className="relative overflow-hidden py-[40px]">
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
        <section className="relative overflow-hidden py-0">
          <div className="container mx-auto relative z-10 px-0 py-[20px]">
            <div className="text-center mb-12">
              <AnimatedText>
                <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Our Services
                </Badge>
              </AnimatedText>
              <AnimatedText delay={200}>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Exceptional Event Services
                </h2>
              </AnimatedText>
              <AnimatedText delay={400}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  From intimate gatherings to grand celebrations, we bring your vision to life
                </p>
              </AnimatedText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services?.map((service, index) => <AnimatedText key={service.id} delay={600 + index * 100}>
                  <Card className="group hover:shadow-xl transition-all duration-500 border-0 glassmorphism-card hover:-translate-y-2 rounded-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:animate-pulse"></div>
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed text-sm">
                        {service.short_description}
                      </p>
                      <Button asChild variant="ghost" className="glassmorphism-btn w-full rounded-xl">
                        <Link to={`/events/${service.event_type}`}>
                          View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </AnimatedText>)}
            </div>
          </div>
        </section>

        {/* Rentals Section */}
        <section className="relative py-0">
          <div className="container mx-auto relative z-10 px-0 py-[20px]">
            <div className="text-center mb-12">
              <AnimatedText>
                <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                  <Clock className="mr-2 h-4 w-4" />
                  Equipment Rental
                </Badge>
              </AnimatedText>
              <AnimatedText delay={200}>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Premium Event Rentals
                </h2>
              </AnimatedText>
              <AnimatedText delay={400}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  High-quality equipment and decor to make your event perfect
                </p>
              </AnimatedText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentals?.map((rental, index) => <AnimatedText key={rental.id} delay={600 + index * 100}>
                  <Card className="group hover:shadow-xl transition-all duration-500 glassmorphism-card border-0 rounded-3xl overflow-hidden hover:-translate-y-2">
                    <div className="h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                    
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-semibold pr-12">
                        {rental.title}
                      </CardTitle>
                      {rental.price_range && <div className="inline-flex items-center bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-full px-3 py-1 w-fit">
                          <p className="text-sm text-secondary font-semibold">
                            $100-500 per event
                          </p>
                        </div>}
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {rental.short_description}
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="glassmorphism-btn w-full rounded-2xl" onClick={() => setSelectedRental(rental.id)}>
                            Enquire Now <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-3xl">
                          <DialogTitle className="sr-only">Rental Inquiry</DialogTitle>
                          <DialogDescription className="sr-only">Submit an inquiry for equipment rental</DialogDescription>
                          <InquiryForm formType="rental" rentalId={rental.id} rentalTitle={rental.title} title="Rental Inquiry" />
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </AnimatedText>)}
            </div>

            <AnimatedText delay={1000} className="text-center mt-10">
              <Button asChild variant="outline" size="lg" className="glassmorphism-btn rounded-2xl">
                <Link to="/ecommerce">
                  View All Rentals <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </AnimatedText>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Trusted Clients */}
        {trustedClients && trustedClients.length > 0 && <section className="relative overflow-hidden py-0">
            <div className="container mx-auto relative z-10 px-0 py-[20px]">
              <div className="text-center mb-12">
                <AnimatedText>
                  <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                    <Users className="mr-2 h-4 w-4" />
                    Trusted By
                  </Badge>
                </AnimatedText>
                <AnimatedText delay={200}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Our Valued Clients
                  </h2>
                </AnimatedText>
              </div>

              <AnimatedText delay={400}>
                <div className="overflow-hidden rounded-2xl glassmorphism-card py-6">
                  <div className="flex animate-scroll space-x-12">
                    {[...trustedClients, ...trustedClients].map((client, index) => <div key={`${client.id}-${index}`} className="flex-shrink-0 h-16 w-32 flex items-center justify-center group">
                        <img src={client.logo_url} alt={client.name} className="max-h-full max-w-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0" />
                      </div>)}
                  </div>
                </div>
              </AnimatedText>
            </div>
          </section>}

        {/* News & Achievements */}
        {newsAchievements && newsAchievements.length > 0 && <section className="relative overflow-hidden py-16">
            <div className="container mx-auto relative z-10 px-4">
              <div className="text-center mb-16">
                <AnimatedText>
                  <Badge variant="secondary" className="mb-6 rounded-full px-8 py-3 text-base">
                    <Award className="mr-3 h-5 w-5" />
                    Latest News & Achievements
                  </Badge>
                </AnimatedText>
                <AnimatedText delay={200}>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                    Celebrating Success
                  </h2>
                </AnimatedText>
                <AnimatedText delay={400}>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Discover our latest achievements, awards, and news that showcase our commitment to excellence in event planning and execution.
                  </p>
                </AnimatedText>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsAchievements.slice(0, 6).map((news, index) => <AnimatedText key={news.id} delay={600 + index * 150}>
                    <Card className="group hover:shadow-2xl transition-all duration-700 glassmorphism-card border-0 rounded-3xl overflow-hidden hover:-translate-y-4 hover:scale-105 h-full relative">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Hero image placeholder or actual image */}
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary-glow/10 to-secondary/20 overflow-hidden">
                        {news.image_url ? (
                          <img 
                            src={news.image_url} 
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary-glow/5 to-secondary/10">
                            <div className="text-center">
                              <Award className="h-12 w-12 text-primary/40 mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground/60 font-medium">Achievement</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Floating date badge */}
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="backdrop-blur-md bg-white/20 border-white/30 text-white rounded-full px-3 py-1 text-xs font-semibold">
                            {new Date(news.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Badge>
                        </div>

                        {/* Decorative corner element */}
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/30 to-transparent rounded-tr-full"></div>
                      </div>

                      <CardHeader className="relative z-10 pb-4 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                              <Star className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Featured</span>
                          </div>
                          
                          {/* Achievement type indicator */}
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 border border-primary/20">
                            <span className="text-xs font-medium text-primary">News</span>
                          </div>
                        </div>
                        
                        <CardTitle className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {news.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="relative z-10 pt-0 pb-6">
                        <p className="text-muted-foreground leading-relaxed line-clamp-4 text-base mb-6">
                          {news.content}
                        </p>
                        
                        {/* Read more button */}
                        <div className="flex items-center justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary-glow hover:bg-primary/5 transition-all duration-300 group/btn"
                          >
                            Read More 
                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </Button>
                          
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Heart className="h-3 w-3" />
                            <span>{Math.floor(Math.random() * 50) + 10}</span>
                          </div>
                        </div>
                      </CardContent>

                      {/* Bottom gradient accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                    </Card>
                  </AnimatedText>)}
              </div>

              {/* Call to action */}
              <AnimatedText delay={1200} className="text-center mt-16">
                <Button 
                  asChild 
                  size="lg" 
                  className="glassmorphism-btn rounded-full px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-500"
                >
                  <Link to="/portfolio">
                    View All News & Updates
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </AnimatedText>
            </div>
          </section>}

        {/* Get in Touch CTA */}
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <AnimatedText>
                <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                  <Heart className="mr-2 h-4 w-4" />
                  Ready to Start?
                </Badge>
              </AnimatedText>
              <AnimatedText delay={200}>
                <h2 className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Let's Create Something Amazing Together
                </h2>
              </AnimatedText>
              <AnimatedText delay={400}>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                  Ready to turn your event dreams into reality? Contact us today and let our expert team craft an unforgettable experience tailored just for you.
                </p>
              </AnimatedText>
              <AnimatedText delay={600}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="xl" className="glassmorphism-btn hover:shadow-glow transition-all duration-300 group text-gray-950">
                        Get Started Now 
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl">
                      <DialogTitle className="sr-only">Contact Us</DialogTitle>
                      <DialogDescription className="sr-only">Get in touch with us for your event needs</DialogDescription>
                      <InquiryForm formType="contact" title="Let's Get Started!" />
                    </DialogContent>
                  </Dialog>
                  <Button asChild variant="outline" size="xl" className="glassmorphism-btn rounded-2xl hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
                    <Link to="/portfolio">
                      View Our Work <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </AnimatedText>
            </div>
          </div>
        </section>
      </div>
    </Layout>;
};
export default Index;