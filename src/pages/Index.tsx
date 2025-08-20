import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCarousel } from "@/components/ui/enhanced-carousel";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useHeroBanners, useServices, useRentals, useTrustedClients, useNewsAchievements } from "@/hooks/useData";
import { ArrowLeft, ArrowRight, Sparkles, Clock, Users, Award, Heart, Calendar, MapPin, Share2, Trophy, Star } from "lucide-react";
import InquiryForm from "@/components/Forms/InquiryForm";
import { AnimatedText, GradientText } from "@/components/ui/animated-text";
import Layout from "@/components/Layout/Layout";
import TestimonialsSection from "@/components/TestimonialsSection";

// Helper component for scroll animations - FIXED
const ScrollAnimated = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {children}
    </div>
  );
};

// Helper component for animating numbers - FIXED
const AnimatedStat = ({ finalValue, suffix = '', isDecimal = false }) => {
    const [count, setCount] = useState(isDecimal ? 0.0 : 0);
    const ref = useRef(null);
    const duration = 2000; // 2 seconds

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const startTime = performance.now();

                    const animate = (currentTime) => {
                        const elapsedTime = currentTime - startTime;
                        const progress = Math.min(elapsedTime / duration, 1);
                        const currentCount = progress * finalValue;

                        if (isDecimal) {
                            setCount(parseFloat(currentCount.toFixed(1)));
                        } else {
                            setCount(Math.floor(currentCount));
                        }

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [finalValue, isDecimal]);

    return (
        <div ref={ref} className="text-2xl lg:text-3xl font-bold text-foreground font-mono tracking-wider drop-shadow-sm">
            {count}{suffix}
        </div>
    );
};

// --- NEW ELEGANT ICONS ---
const IconHappyClients = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 18C17 15.7909 14.7614 14 12 14C9.23858 14 7 15.7909 7 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.664 17.5C20.875 16.446 21 15.245 21 14C21 10.134 17.866 7 14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
    <path d="M3.336 17.5C3.125 16.446 3 15.245 3 14C3 10.134 6.134 7 10 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
  </svg>
);

const IconEventsCompleted = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 7V3M16 7V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 12.5L5.5 15L8 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconRatingAverage = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2V17.77" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconYearsExperience = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const Index = () => {
  const [selectedPost, setSelectedPost] = useState < any > (null);
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
  } = useNewsAchievements(true); // Only show news achievements marked to show on home
  const [selectedRental, setSelectedRental] = useState < string | null > (null);

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
    <div className="bg-gradient-to-b from-background via-muted/10 via-background/80 to-primary/5">
      {/* Hero Section with Enhanced Carousel */}
      <div className="relative">
        {heroBanners && heroBanners.length > 0 ? (
          <EnhancedCarousel className="w-full h-screen relative" autoPlay={true} delay={6000} showDots={true}>
            {heroBanners.map(banner => (
              <div key={banner.id} className="h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" style={{
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
                    <Button asChild variant="premium" className="glassmorphism-btn text-lg px-8 py-3">
                      <Link to={`/events/${banner.event_type}`}>
                        {banner.button_text} <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </AnimatedText>
                </div>
              </div>
            ))}
          </EnhancedCarousel>
        ) : (
          <div className="h-screen flex items-center justify-center text-center max-w-4xl mx-auto px-4">
            <div>
              <AnimatedText variant="fade-in-up" className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                <GradientText>Creating Unforgettable</GradientText><br />
                <GradientText variant="secondary">Moments</GradientText>
              </AnimatedText>
              <AnimatedText variant="fade-in-up" delay={300} className="text-lg md:text-xl mb-6 text-muted-foreground">
                Premium event management and rental services for your special occasions
              </AnimatedText>
              <AnimatedText variant="scale-in" delay={600}>
                <Button asChild variant="premium" className="glassmorphism-btn text-lg px-8 py-3">
                  <Link to="/services">
                    Explore Services <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </AnimatedText>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section - COMPLETE REDESIGN */}
      <ScrollAnimated>
        <section className="relative overflow-hidden py-8 lg:py-12">
          <div className="container mx-auto px-4 relative z-10 max-w-6xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Stat Card 1 - Happy Clients */}
              <div className="group relative overflow-hidden rounded-xl p-4 lg:p-5 text-center bg-card/80 backdrop-blur-sm border border-border/60 transition-all duration-500 hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1 hover:bg-emerald-950/20">
                {/* Floating background elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-400/30 rounded-full blur-lg group-hover:scale-150 group-hover:rotate-45 transition-all duration-700"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-green-400/20 rounded-full blur-md group-hover:scale-125 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  {/* Animated Icon Container */}
                  <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-emerald-500/20 rounded-xl mb-3 lg:mb-4 border border-emerald-400/30 group-hover:bg-emerald-500/30 group-hover:border-emerald-400/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Users className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  
                  {/* Animated Number */}
                  <div className="relative mb-1">
                    <AnimatedStat finalValue={100} suffix="+" />
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs lg:text-sm font-semibold text-foreground/80 group-hover:text-emerald-200 transition-colors duration-300 font-mono tracking-wide">
                    Happy Clients
                  </div>
                </div>
              </div>

              {/* Stat Card 2 - Events Completed */}
              <div className="group relative overflow-hidden rounded-xl p-4 lg:p-5 text-center bg-card/80 backdrop-blur-sm border border-border/60 transition-all duration-500 hover:border-orange-400/60 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1 hover:bg-orange-950/20">
                {/* Floating background elements */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-orange-400/30 rounded-full blur-lg group-hover:scale-150 group-hover:-rotate-45 transition-all duration-700"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400/20 rounded-full blur-md group-hover:scale-125 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  {/* Animated Icon Container */}
                  <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-orange-500/20 rounded-xl mb-3 lg:mb-4 border border-orange-400/30 group-hover:bg-orange-500/30 group-hover:border-orange-400/50 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                    <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-orange-400 group-hover:text-orange-300 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  
                  {/* Animated Number */}
                  <div className="relative mb-1">
                    <AnimatedStat finalValue={500} suffix="+" />
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs lg:text-sm font-semibold text-foreground/80 group-hover:text-orange-200 transition-colors duration-300 font-mono tracking-wide">
                    Events Done
                  </div>
                </div>
              </div>

              {/* Stat Card 3 - Rating Average */}
              <div className="group relative overflow-hidden rounded-xl p-4 lg:p-5 text-center bg-card/80 backdrop-blur-sm border border-border/60 transition-all duration-500 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 hover:bg-purple-950/20">
                {/* Floating background elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-purple-400/30 rounded-full blur-lg group-hover:scale-150 group-hover:rotate-90 transition-all duration-700"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-violet-400/20 rounded-full blur-md group-hover:scale-125 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  {/* Animated Icon Container */}
                  <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-purple-500/20 rounded-xl mb-3 lg:mb-4 border border-purple-400/30 group-hover:bg-purple-500/30 group-hover:border-purple-400/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <Star className="h-5 w-5 lg:h-6 lg:w-6 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 group-hover:rotate-180 transition-all duration-500" />
                  </div>
                  
                  {/* Animated Number */}
                  <div className="relative mb-1">
                    <AnimatedStat finalValue={4.9} isDecimal={true} />
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs lg:text-sm font-semibold text-foreground/80 group-hover:text-purple-200 transition-colors duration-300 font-mono tracking-wide">
                    Avg Rating
                  </div>
                </div>
              </div>

              {/* Stat Card 4 - Years Experience */}
              <div className="group relative overflow-hidden rounded-xl p-4 lg:p-5 text-center bg-card/80 backdrop-blur-sm border border-border/60 transition-all duration-500 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 hover:bg-blue-950/20">
                {/* Floating background elements */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-400/30 rounded-full blur-lg group-hover:scale-150 group-hover:-rotate-90 transition-all duration-700"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyan-400/20 rounded-full blur-md group-hover:scale-125 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  {/* Animated Icon Container */}
                  <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-blue-500/20 rounded-xl mb-3 lg:mb-4 border border-blue-400/30 group-hover:bg-blue-500/30 group-hover:border-blue-400/50 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                    <Award className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                  </div>
                  
                  {/* Animated Number */}
                  <div className="relative mb-1">
                    <AnimatedStat finalValue={15} suffix="+" />
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs lg:text-sm font-semibold text-foreground/80 group-hover:text-blue-200 transition-colors duration-300 font-mono tracking-wide">
                    Years Exp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimated>

      {/* Services Section */}
      <ScrollAnimated>
        <section className="relative overflow-hidden py-16 lg:py-20">
          <div className="container mx-auto relative z-10 px-4 max-w-6xl">
            <div className="text-center mb-12 lg:mb-14">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
              {services?.map((service, index) => (
                <AnimatedText key={service.id} delay={600 + index * 100}>
                  <Card className="group hover:shadow-xl transition-all duration-500 border-0 glassmorphism-card hover:-translate-y-2 rounded-2xl overflow-hidden relative">
                    <div className="h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                    
                    {service.image_url && service.image_url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? (
                      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${service.image_url})` }}>
                        <div className="h-full bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="h-12 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-primary/60" />
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-primary" />
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {service.short_description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {service.event_type}
                        </Badge>
                      </div>

                      <div className="pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                              Learn More
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Inquire About {service.title}</DialogTitle>
                              <DialogDescription>
                                Get a personalized quote for your {service.title.toLowerCase()} needs.
                              </DialogDescription>
                            </DialogHeader>
                            <InquiryForm
                              formType="contact"
                              eventType={service.event_type}
                              title="Get Service Quote"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedText>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimated>

      {/* Equipment Rental Section */}
      <ScrollAnimated>
        <section className="relative overflow-hidden py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto relative z-10 px-4 max-w-6xl">
            <div className="text-center mb-12 lg:mb-14">
              <AnimatedText>
                <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                  <Trophy className="mr-2 h-4 w-4" />
                  Equipment Rental
                </Badge>
              </AnimatedText>
              <AnimatedText delay={200}>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Premium Rental Collection
                </h2>
              </AnimatedText>
              <AnimatedText delay={400}>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  High-quality equipment and furniture for your perfect event setup
                </p>
              </AnimatedText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
              {rentals?.slice(0, 6).map((rental, index) => (
                <AnimatedText key={rental.id} delay={600 + index * 100}>
                  <Card className="group hover:shadow-xl transition-all duration-500 border-0 glassmorphism-card hover:-translate-y-2 rounded-2xl overflow-hidden relative">
                    <div className="h-1 bg-gradient-to-r from-secondary via-accent to-primary"></div>
                    
                    {rental.image_url ? (
                      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${rental.image_url})` }}>
                        <div className="h-full bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Trophy className="h-12 w-12 text-primary/60" />
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {rental.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {rental.short_description || rental.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {rental.price_range && (
                          <Badge variant="outline" className="text-xs">
                            {rental.price_range}
                          </Badge>
                        )}
                        {rental.categories && rental.categories.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {rental.categories[0]}
                          </Badge>
                        )}
                      </div>

                      <div className="pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300"
                              onClick={() => setSelectedRental(rental.id)}
                            >
                              Inquire
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Inquire About {rental.title}</DialogTitle>
                              <DialogDescription>
                                Get availability and pricing for this rental item.
                              </DialogDescription>
                            </DialogHeader>
                            <InquiryForm
                              formType="rental"
                              rentalId={rental.id}
                              rentalTitle={rental.title}
                              title="Get Rental Quote"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedText>
              ))}
            </div>

            <AnimatedText delay={1200}>
              <div className="text-center mt-12">
                <Button asChild size="lg" className="glassmorphism-btn text-lg px-8 py-3 rounded-2xl">
                  <Link to="/ecommerce">
                    View All Equipment <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </AnimatedText>
          </div>
        </section>
      </ScrollAnimated>

      {/* Trusted Clients Carousel Section */}
      {trustedClients && trustedClients.length > 0 && (
        <ScrollAnimated>
          <section className="relative overflow-hidden py-16 lg:py-20">
            <div className="container mx-auto relative z-10 px-4 max-w-6xl">
              <div className="text-center mb-12">
                <AnimatedText>
                  <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                    <Heart className="mr-2 h-4 w-4" />
                    Trusted By
                  </Badge>
                </AnimatedText>
                <AnimatedText delay={200}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Our Valued Clients
                  </h2>
                </AnimatedText>
                <AnimatedText delay={400}>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    We're honored to work with amazing organizations and individuals
                  </p>
                </AnimatedText>
              </div>

              <div className="overflow-hidden relative">
                <div className="flex animate-scroll-x whitespace-nowrap">
                  {[...trustedClients, ...trustedClients, ...trustedClients].map((client, index) => (
                    <div key={`${client.id}-${index}`} className="flex-shrink-0 mx-6 lg:mx-8">
                      <div className="w-28 lg:w-32 h-16 lg:h-20 flex items-center justify-center bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/40 hover:bg-card/80 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg">
                        {client.logo_url ? (
                          <img 
                            src={client.logo_url} 
                            alt={client.name}
                            className="max-w-20 lg:max-w-24 max-h-10 lg:max-h-12 object-contain opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                          />
                        ) : (
                          <div className="text-muted-foreground text-xs lg:text-sm font-medium text-center px-2">
                            {client.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollAnimated>
      )}

      {/* Awards & Achievements Section */}
      {newsAchievements && newsAchievements.length > 0 && (
        <ScrollAnimated>
          <section className="relative overflow-hidden py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto relative z-10 px-4 max-w-6xl">
              <div className="text-center mb-12">
                <AnimatedText>
                  <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                    <Award className="mr-2 h-4 w-4" />
                    Awards & Achievements
                  </Badge>
                </AnimatedText>
                <AnimatedText delay={200}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Recognition & Milestones
                  </h2>
                </AnimatedText>
                <AnimatedText delay={400}>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Celebrating our journey and achievements in the event industry
                  </p>
                </AnimatedText>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsAchievements.slice(0, 6).map((achievement, index) => (
                  <AnimatedText key={achievement.id} delay={600 + index * 100}>
                    <Card className="group hover:shadow-xl transition-all duration-500 border-0 glassmorphism-card hover:-translate-y-2 rounded-2xl overflow-hidden relative cursor-pointer">
                      <div className="h-1 bg-gradient-to-r from-accent via-primary to-secondary"></div>
                      
                      {achievement.image_url && (
                        <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${achievement.image_url})` }}>
                          <div className="h-full bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center text-xs text-muted-foreground mb-2">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(achievement.created_at).toLocaleDateString()}
                            </div>
                            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                              {achievement.title}
                            </CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs ml-2">
                            News
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {achievement.short_content || achievement.content?.substring(0, 120) + '...'}
                        </p>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300"
                              onClick={() => setSelectedPost(achievement)}
                            >
                              Read More
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-left">{achievement.title}</DialogTitle>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-1 h-4 w-4" />
                                {new Date(achievement.created_at).toLocaleDateString()}
                                <Badge variant="outline" className="ml-2 text-xs">
                                  News
                                </Badge>
                              </div>
                            </DialogHeader>
                            
                            {achievement.image_url && (
                              <div className="w-full h-64 bg-cover bg-center rounded-lg mb-4" 
                                   style={{ backgroundImage: `url(${achievement.image_url})` }}>
                              </div>
                            )}
                            
                            <div className="prose prose-sm max-w-none">
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {achievement.content}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center space-x-2">
                                <Share2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Share this news</span>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/blog/${achievement.id}`}>
                                  View Full Article
                                </Link>
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  </AnimatedText>
                ))}
              </div>

              <AnimatedText delay={1200}>
                <div className="text-center mt-12">
                  <Button asChild size="lg" className="glassmorphism-btn text-lg px-8 py-3 rounded-2xl">
                    <Link to="/blog">
                      View All News <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </AnimatedText>
            </div>
          </section>
        </ScrollAnimated>
      )}

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Get In Touch Section */}
      <ScrollAnimated>
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="container mx-auto relative z-10 px-4 max-w-4xl text-center">
            <AnimatedText>
              <Badge variant="secondary" className="mb-6 rounded-full px-6 py-2">
                <MapPin className="mr-2 h-4 w-4" />
                Get In Touch
              </Badge>
            </AnimatedText>
            
            <AnimatedText delay={200}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                Ready to Create Something Amazing?
              </h2>
            </AnimatedText>
            
            <AnimatedText delay={400}>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Let's bring your vision to life with our exceptional event planning and rental services.
              </p>
            </AnimatedText>

            <AnimatedText delay={600}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="glassmorphism-btn text-lg px-8 py-3 rounded-2xl">
                      Start Your Event <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Let's Plan Your Perfect Event</DialogTitle>
                      <DialogDescription>
                        Tell us about your event and we'll help make it extraordinary.
                      </DialogDescription>
                    </DialogHeader>
                    <InquiryForm
                      formType="contact"
                      title="General Inquiry"
                    />
                  </DialogContent>
                </Dialog>
                
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 rounded-2xl border-primary/30 hover:bg-primary/10">
                  <Link to="/services">
                    Explore Services
                  </Link>
                </Button>
              </div>
            </AnimatedText>
          </div>
        </section>
      </ScrollAnimated>
    </div>
  </Layout>;
};

export default Index;
