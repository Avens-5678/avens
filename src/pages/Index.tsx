import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { WhatsAppBot } from "@/components/ui/whatsapp-bot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useHeroBanners, useServices, useRentals, useTrustedClients, useAboutContent } from "@/hooks/useData";
import { useDashboardPath } from "@/hooks/useDashboardPath";
import { ArrowRight, Sparkles, Award, Calendar, Camera, Heart, User, Trophy, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import InquiryForm from "@/components/Forms/InquiryForm";
import { GradientText } from "@/components/ui/animated-text";
import Layout from "@/components/Layout/Layout";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { HeroSection } from "@/components/ui/hero-section";
import { GlassmorphismCard } from "@/components/ui/glassmorphism-card";
import { StatsContainer, StatCard } from "@/components/ui/elegant-stats";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceScrollContainer } from "@/components/ui/service-scroll-container";
import { CursorTrail } from "@/components/ui/cursor-trail";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { TiltCard } from "@/components/ui/tilt-card";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { SectionDivider } from "@/components/ui/section-divider";
import ScrollReveal from "@/components/ui/scroll-reveal";

// DO NOT use React.lazy() at module level — Vite TDZ bug
// Created at first render via getTestimonialsSection()
let _cachedTestimonials: ReturnType<typeof lazy> | null = null;
const getTestimonialsSection = () => {
  if (!_cachedTestimonials) _cachedTestimonials = lazy(() => import("@/components/TestimonialsSection"));
  return _cachedTestimonials;
};

// Skeleton loaders for faster perceived loading
const HeroSkeleton = () =>
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
    <div className="text-center space-y-6 max-w-2xl px-4">
      <Skeleton className="h-16 w-3/4 mx-auto" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-2/3 mx-auto" />
      <div className="flex gap-4 justify-center">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
  </div>;


const CardSkeleton = () =>
<div className="space-y-4 p-6">
    <Skeleton className="aspect-video w-full rounded-lg" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>;


const Index = () => {
  const TestimonialsSection = getTestimonialsSection();
  const isMobile = useIsMobile();
  const { getServiceRequestPath } = useDashboardPath();
  // Core data - only essential for above-the-fold
  const { data: heroBanners, isLoading: loadingBanners } = useHeroBanners();
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: rentals, isLoading: loadingRentals } = useRentals();
  const { data: trustedClients, isLoading: loadingClients } = useTrustedClients();
  const { data: aboutContent } = useAboutContent();

  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showBannerFallback, setShowBannerFallback] = useState(false);

  // Touch swipe for mobile hero carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [showArrows, setShowArrows] = useState(true);
  const arrowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRotateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Filter data
  const homeServices = services?.filter((s) => s.show_on_home && s.is_active) || [];
  const homeRentals = rentals?.filter((r) => r.show_on_home && r.is_active) || [];
  const activeClients = trustedClients?.filter((c) => c.is_active) || [];
  const activeBanners = heroBanners?.filter((b) => b.is_active) || [];

  const currentBanner = activeBanners[currentBannerIndex];

  // Auto-hide arrows after 3s of inactivity
  const resetArrowTimer = useCallback(() => {
    setShowArrows(true);
    if (arrowTimeoutRef.current) clearTimeout(arrowTimeoutRef.current);
    arrowTimeoutRef.current = setTimeout(() => setShowArrows(false), 3000);
  }, []);

  useEffect(() => {
    resetArrowTimer();
    return () => {if (arrowTimeoutRef.current) clearTimeout(arrowTimeoutRef.current);};
  }, [resetArrowTimer]);

  // Auto-rotate banners every 7 seconds (pause on hover)
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    autoRotateRef.current = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 7000);

    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [activeBanners.length, isPaused]);

  useEffect(() => {
    if (!loadingBanners) {
      setShowBannerFallback(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowBannerFallback(true);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [loadingBanners]);

  // Show skeleton only briefly; then render fallback hero if banner query is stuck
  if (loadingBanners && !showBannerFallback) {
    return <Layout><HeroSkeleton /></Layout>;
  }

  return (
    <>
    {!isMobile && <CursorTrail color="hsl(222, 65%, 42%)" size={24} duration={0.6} />}
    <Layout>
      {/* Hero Section - Simple, no heavy animations */}
      <HeroSection
          backgroundImage={currentBanner?.image_url}
          className="relative overflow-hidden"
          onMouseMove={resetArrowTimer}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={(e: React.TouchEvent) => {
            touchStartX.current = e.changedTouches[0].screenX;
            setIsPaused(true);
          }}
          onTouchEnd={(e: React.TouchEvent) => {
            touchEndX.current = e.changedTouches[0].screenX;
            if (touchStartX.current !== null && activeBanners.length > 1) {
              const diff = touchStartX.current - touchEndX.current;
              if (Math.abs(diff) > 50) {
                if (diff > 0) {
                  setCurrentBannerIndex((prev) => prev === activeBanners.length - 1 ? 0 : prev + 1);
                } else {
                  setCurrentBannerIndex((prev) => prev === 0 ? activeBanners.length - 1 : prev - 1);
                }
              }
            }
            touchStartX.current = null;
            setIsPaused(false);
          }}>

        {/* Desktop/Tablet navigation arrows - auto-hide on inactivity */}
        {!isMobile && activeBanners.length > 1 &&
          <>
            <button
              onClick={() => {setCurrentBannerIndex((prev) => prev === 0 ? activeBanners.length - 1 : prev - 1);resetArrowTimer();}}
              className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all duration-500 ${showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              aria-label="Previous banner">

              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => {setCurrentBannerIndex((prev) => prev === activeBanners.length - 1 ? 0 : prev + 1);resetArrowTimer();}}
              className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all duration-500 ${showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              aria-label="Next banner">

              <ChevronRight className="h-6 w-6" />
            </button>
          </>
          }

        <div className="container mx-auto px-5 sm:px-6 text-center relative z-20">
          <h1 
            key={`title-${currentBannerIndex}`}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.05] text-white animate-fade-in-up"
            style={{ animationDuration: '0.8s' }}
          >
            {currentBanner?.title || "Creating Extraordinary Experiences"}
          </h1>

          <p 
            key={`subtitle-${currentBannerIndex}`}
            className="text-lg sm:text-xl lg:text-2xl font-body mb-12 max-w-3xl mx-auto leading-relaxed text-white/80 animate-fade-in-up opacity-0"
            style={{ animationDelay: '0.3s', animationDuration: '0.8s', animationFillMode: 'forwards' }}
          >
            {currentBanner?.subtitle || "Where vision meets execution. We transform your dreams into unforgettable moments."}
          </p>

          <div 
            key={`cta-${currentBannerIndex}`}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up opacity-0"
            style={{ animationDelay: '0.6s', animationDuration: '0.8s', animationFillMode: 'forwards' }}
          >
            <MagneticButton
                size="lg"
                strength={15}
                className="bg-secondary hover:bg-secondary/90 text-white px-8 py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl"
                asChild>
              <Link to={`/events/${currentBanner?.event_type?.toLowerCase().replace(/\s+/g, '-') || 'corporate'}`}>
                {currentBanner?.button_text || "Explore Services"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </MagneticButton>
            <MagneticButton
                variant="outline"
                size="lg"
                strength={15}
                className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white px-8 py-4 text-base font-semibold rounded-xl"
                asChild>
              <Link to="/portfolio">
                View Portfolio
                <Camera className="ml-2 h-5 w-5" />
              </Link>
            </MagneticButton>
          </div>
        </div>



      </HeroSection>

      {/* Stats Section */}
      <Section spacing="default" variant="muted" className="relative">
        <BackgroundPattern variant="dots" />
        <StatsContainer>
          <ScrollReveal animation="fade-in-up">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-foreground">
                The only platform that creates extraordinary
                <br />
                <span className="text-primary">& memorable events</span> with precision
              </h2>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <StatCard number="500+" label="EVENTS MANAGED" />
            <StatCard number="50+" label="CORPORATE CLIENTS" />
            <StatCard number="5000+" label="SATISFIED GUESTS" />
            <StatCard number="100%" label="SUCCESS RATE" />
          </div>
        </StatsContainer>
      </Section>

      {/* Services Section */}
      <Section spacing="default" className="relative overflow-hidden">
        <BackgroundPattern variant="noise" />
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in-up">
            <SectionHeader
              badge={<Badge variant="outline"><Sparkles className="mr-2 h-4 w-4" />Premium Services</Badge>}
              title="Exceptional Event Management"
              description="From intimate gatherings to grand celebrations, we deliver sophistication and excellence." />
          </ScrollReveal>

          
          {loadingServices ?
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div> :

            <ScrollReveal animation="fade-in-up" delay={100}>
              <ServiceScrollContainer items={homeServices}>
                {homeServices.map((service) =>
                <TiltCard key={service.id} tiltDegree={8} scale={1.02} glareMaxOpacity={0.15} className="h-full">
                <GlassmorphismCard
                  className="group p-3 md:p-6 hover:shadow-lg transition-shadow duration-300 h-full"
                  variant="subtle">

                  <div className="space-y-2.5 md:space-y-4">
                    {service.image_url &&
                  <div className="relative overflow-hidden rounded-lg aspect-[16/9] md:aspect-video">
                        <OptimizedImage
                      src={service.image_url}
                      alt={service.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                      </div>
                  }
                    <div className="space-y-2 md:space-y-3">
                      <h3 className="text-base md:text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">
                        {service.short_description}
                      </p>
                      <Button variant="ghost" className="p-0 h-auto font-semibold" asChild>
                        <Link to={`/events/${service.event_type.toLowerCase().replace(/\s+/g, '-')}`}>
                          Learn More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </GlassmorphismCard>
              </TiltCard>
              )}
              </ServiceScrollContainer>
            </ScrollReveal>
            }

          {homeServices.length > 0 &&
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link to="/services">
                  View All Services <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            }
        </div>
      </Section>

      {/* About CTA Section */}
      {aboutContent &&
        <Section variant="gradient" spacing="default">
          <div className="container mx-auto px-5 sm:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <Badge variant="outline" className="mb-4">
                <User className="mr-2 h-3.5 w-3.5" />
                About Us
              </Badge>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-foreground">
                Ready to Start Planning Your
                <span className="text-primary block">Perfect Event?</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Let's bring your vision to life with our expertise in creating unforgettable experiences.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-base font-semibold"
                  asChild>
                   <Link to={getServiceRequestPath('')}>
                    Start Planning Today
                    <Calendar className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-base font-semibold" asChild>
                  <Link to="/about">
                    Learn About Us <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Section>
        }

      {/* Equipment Rental Section */}
      <Section spacing="default" variant="muted" className="relative overflow-hidden">
        <BackgroundPattern variant="dots" />
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in-up">
            <SectionHeader
              badge={<Badge variant="outline"><Award className="mr-2 h-4 w-4" />Premium Equipment</Badge>}
              title="Professional Event Rentals"
              description="High-quality equipment to elevate your event experience." />
          </ScrollReveal>

          
          {loadingRentals ?
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div> :

            <ScrollReveal animation="fade-in-up" delay={100}>
              <ServiceScrollContainer items={homeRentals.slice(0, 6)}>
                {homeRentals.slice(0, 6).map((rental) =>
                <GlassmorphismCard
                  key={rental.id}
                  className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">

                  <div className="relative">
                    {rental.image_url ?
                  <div className="aspect-[16/9] md:aspect-video relative overflow-hidden">
                        <OptimizedImage
                      src={rental.image_url}
                      alt={rental.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                      </div> :

                  <div className="aspect-[16/9] md:aspect-video bg-muted flex items-center justify-center">
                        <Award className="h-12 w-12 text-muted-foreground" />
                      </div>
                  }
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <h3 className="text-base md:text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {rental.title}
                      </h3>
                      {rental.price_range &&
                    <Badge variant="secondary" className="font-medium text-xs md:text-sm">
                          {rental.price_range}
                        </Badge>
                    }
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">
                        {rental.short_description}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedRental(rental);
                        setInquiryDialogOpen(true);
                      }}>

                        Inquire
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-accent" asChild>
                        <Link to="/ecommerce">View All</Link>
                      </Button>
                    </div>
                  </div>
                </GlassmorphismCard>
              )}
              </ServiceScrollContainer>
            </ScrollReveal>
            }

          {homeRentals.length > 0 &&
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link to="/ecommerce">
                  View All Equipment <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            }
        </div>
      </Section>

      {/* Trusted Clients - Marquee */}
      {activeClients.length > 0 &&
        <Section spacing="compact">
          <div className="container mx-auto px-4">
            <SectionHeader
              badge={<Badge variant="outline"><Users className="mr-2 h-4 w-4" />Trusted Partners</Badge>}
              title="Prestigious Clientele"
              description="Proud to serve leading organizations across various industries." />

            <div className="overflow-hidden relative">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              
              <div className="flex animate-marquee w-max items-center gap-12 lg:gap-16 py-4">
                {[...activeClients, ...activeClients, ...activeClients].map((client, i) =>
                <div
                  key={`${client.id}-${i}`}
                  className="flex-shrink-0 hover:opacity-80 transition-all duration-300 px-2">
                    <OptimizedImage
                    src={client.logo_url}
                    alt={client.name}
                    loading="lazy"
                    className="h-12 w-auto object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>
        }

      {/* Testimonials - Lazy loaded */}
      <Section variant="gradient" spacing="default">
        <div className="container mx-auto px-4">
          <Suspense fallback={
            <div className="text-center py-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-32 w-full max-w-2xl mx-auto" />
            </div>
            }>
            <TestimonialsSection />
          </Suspense>
        </div>
      </Section>

      {/* Final CTA */}
      <Section variant="muted" spacing="default">
        <div className="container mx-auto px-5 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge variant="outline" className="mb-4">
              <Heart className="mr-2 h-3.5 w-3.5" />
              Let's Create Magic Together
            </Badge>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-foreground">
              Ready to Create Your
              <span className="text-primary block">Dream Event?</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              From conceptualization to execution, we're here to transform your vision into an 
              extraordinary experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-base font-semibold"
                  asChild>
                  <Link to={getServiceRequestPath('')}>
                    Start Planning
                    <Calendar className="ml-2 h-5 w-5" />
                  </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-base font-semibold" asChild>
                <Link to="/portfolio">
                  View Our Work
                  <Camera className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {selectedRental ? `Inquire About ${selectedRental.title}` : 'Event Inquiry'}
            </DialogTitle>
          </DialogHeader>
          <InquiryForm
              formType={selectedRental ? "rental" : "inquiry"}
              title={selectedRental ? `${selectedRental.title} Inquiry` : "General Inquiry"}
              rentalId={selectedRental?.id}
              rentalTitle={selectedRental?.title}
              onSuccess={() => {
                setInquiryDialogOpen(false);
                setSelectedRental(null);
              }} />

        </DialogContent>
      </Dialog>
    </Layout>
    <WhatsAppBot />
    </>);

};

export default Index;