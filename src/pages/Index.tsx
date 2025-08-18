import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useHeroBanners, useServices, useRentals, useTrustedClients, useNewsAchievements } from "@/hooks/useData";
import { ArrowLeft, ArrowRight, Sparkles, Clock, Users, Award, CheckCircle, Star, Trophy, Heart, Calendar, MapPin, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InquiryForm from "@/components/Forms/InquiryForm";
import Autoplay from "embla-carousel-autoplay";
import { HeroSection } from "@/components/ui/hero-section";
import { AnimatedText, GradientText } from "@/components/ui/animated-text";
import Layout from "@/components/Layout/Layout";
import TestimonialsSection from "@/components/TestimonialsSection";

// Helper component for scroll animations
const ScrollAnimated = ({ children, className }) => {
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

// Helper component for animating numbers
const AnimatedStat = ({ finalValue, suffix, isDecimal }) => {
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
        <div ref={ref} className="text-3xl lg:text-4xl font-bold text-foreground">
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
  } = useNewsAchievements();
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
          {/* Persistent carousel navigation */}
          <CarouselPrevious className="hero-arrow left-4 bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-md transition-all duration-300 hidden md:flex" />
          <CarouselNext className="hero-arrow right-4 bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-md transition-all duration-300 hidden md:flex" />
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

      {/* Stats Section - REDESIGNED */}
      <ScrollAnimated>
        <section className="relative overflow-hidden py-12 lg:py-16">
          <div className="container mx-auto px-4 relative z-10 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat Card 1 */}
              <div className="relative overflow-hidden rounded-2xl p-6 text-center bg-white/5 backdrop-blur-lg border border-white/10 group transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl mb-4 border border-primary/20">
                    <IconHappyClients className="h-7 w-7 text-primary" />
                  </div>
                  <AnimatedStat finalValue={100} suffix="+" />
                  <div className="text-sm text-muted-foreground mt-1">Happy Clients</div>
                </div>
              </div>
              {/* Stat Card 2 */}
              <div className="relative overflow-hidden rounded-2xl p-6 text-center bg-white/5 backdrop-blur-lg border border-white/10 group transition-all duration-300 hover:border-secondary/30 hover:shadow-2xl hover:shadow-secondary/10">
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl mb-4 border border-secondary/20">
                    <IconEventsCompleted className="h-7 w-7 text-secondary" />
                  </div>
                  <AnimatedStat finalValue={500} suffix="+" />
                  <div className="text-sm text-muted-foreground mt-1">Events Completed</div>
                </div>
              </div>
              {/* Stat Card 3 */}
              <div className="relative overflow-hidden rounded-2xl p-6 text-center bg-white/5 backdrop-blur-lg border border-white/10 group transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                   <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl mb-4 border border-primary/20">
                    <IconRatingAverage className="h-7 w-7 text-primary" />
                  </div>
                  <AnimatedStat finalValue={4.9} isDecimal={true} />
                  <div className="text-sm text-muted-foreground mt-1">Rating Average</div>
                </div>
              </div>
              {/* Stat Card 4 */}
              <div className="relative overflow-hidden rounded-2xl p-6 text-center bg-white/5 backdrop-blur-lg border border-white/10 group transition-all duration-300 hover:border-secondary/30 hover:shadow-2xl hover:shadow-secondary/10">
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                   <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl mb-4 border border-secondary/20">
                    <IconYearsExperience className="h-7 w-7 text-secondary" />
                  </div>
                  <AnimatedStat finalValue={15} suffix="+" />
                  <div className="text-sm text-muted-foreground mt-1">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimated>

      {/* Services Section - Desktop Optimized */}
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
              {services?.map((service, index) => <AnimatedText key={service.id} delay={600 + index * 100}>
                  <Card
                    className="group hover:shadow-xl transition-all duration-500 border-0 glassmorphism-card hover:-translate-y-2 rounded-2xl overflow-hidden relative"
                    onMouseMove={(e) => {
                      const card = e.currentTarget;
                      const { left, top, width, height } = card.getBoundingClientRect();
                      const x = e.clientX - left;
                      const y = e.clientY - top;
                      card.style.setProperty('--mouse-x', `${x}px`);
                      card.style.setProperty('--mouse-y', `${y}px`);
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.1), transparent 70%)`,
                      }}
                    />
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
      </ScrollAnimated>

      {/* Rentals Section - Desktop Optimized */}
      <ScrollAnimated>
        <section className="relative py-16 lg:py-20">
          <div className="container mx-auto relative z-10 px-4 max-w-6xl">
            <div className="text-center mb-12 lg:mb-14">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
              {rentals?.map((rental, index) => <AnimatedText key={rental.id} delay={600 + index * 100}>
                  <Card
                    className="group hover:shadow-xl transition-all duration-500 glassmorphism-card border-0 rounded-2xl overflow-hidden hover:-translate-y-2 relative"
                    onMouseMove={(e) => {
                      const card = e.currentTarget;
                      const { left, top, width, height } = card.getBoundingClientRect();
                      const x = e.clientX - left;
                      const y = e.clientY - top;
                      card.style.setProperty('--mouse-x', `${x}px`);
                      card.style.setProperty('--mouse-y', `${y}px`);
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.1), transparent 70%)`,
                      }}
                    />
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
      </ScrollAnimated>

      {/* Trusted Clients - Desktop Optimized */}
      {trustedClients && trustedClients.length > 0 && <ScrollAnimated>
        <section className="relative overflow-hidden py-16 lg:py-20">
            <div className="container mx-auto relative z-10 px-4 max-w-6xl">
              <div className="text-center mb-12 lg:mb-14">
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
                  <div className="overflow-hidden rounded-2xl glassmorphism-card py-8 lg:py-12">
                   <div className="flex animate-scroll space-x-16 lg:space-x-20">
                    {[...trustedClients, ...trustedClients].map((client, index) => <div key={`${client.id}-${index}`} className="flex-shrink-0 h-20 lg:h-24 w-40 lg:w-48 flex items-center justify-center group">
                        <img src={client.logo_url} alt={client.name} className="max-h-full max-w-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0" />
                      </div>)}
                  </div>
                </div>
              </AnimatedText>
            </div>
          </section>
        </ScrollAnimated>}

      {/* Awards & Achievements - Desktop Optimized */}
      {newsAchievements && newsAchievements.length > 0 && <ScrollAnimated>
        <section className="relative overflow-hidden py-16 lg:py-20">
            <div className="container mx-auto relative z-10 px-4 max-w-6xl">
              <div className="text-center mb-12 lg:mb-14">
                <AnimatedText>
                  <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                    <Award className="mr-2 h-4 w-4" />
                    Awards & Achievements
                  </Badge>
                </AnimatedText>
                <AnimatedText delay={200}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                    Our Success Stories
                  </h2>
                </AnimatedText>
                <AnimatedText delay={400}>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Celebrating milestones and recognition that reflect our commitment to excellence
                  </p>
                </AnimatedText>
              </div>

              {/* Desktop optimized awards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto">
                {newsAchievements.slice(0, 3).map((news, index) => <AnimatedText key={news.id} delay={600 + index * 100}>
                    <Card
                      className="group hover:shadow-lg transition-all duration-500 glassmorphism-card border-0 rounded-2xl overflow-hidden hover:-translate-y-2 h-full relative"
                      onMouseMove={(e) => {
                        const card = e.currentTarget;
                        const { left, top, width, height } = card.getBoundingClientRect();
                        const x = e.clientX - left;
                        const y = e.clientY - top;
                        card.style.setProperty('--mouse-x', `${x}px`);
                        card.style.setProperty('--mouse-y', `${y}px`);
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `radial-gradient(300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.1), transparent 70%)`,
                        }}
                      />
                      {/* Compact image */}
                      <div className="relative h-32 bg-gradient-to-br from-primary/10 via-primary-glow/5 to-secondary/10 overflow-hidden">
                        {news.image_url ? (
                          <img
                            src={news.image_url}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-primary/40" />
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="backdrop-blur-md bg-white/20 border-white/30 text-white rounded-full px-2 py-1 text-xs">
                            {new Date(news.created_at).getFullYear()}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-2">
                          {news.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-3">
                          {news.content}
                        </p>
                        
                        <Button
                          variant="ghost"
                          className="group/btn h-auto rounded-full bg-transparent px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:shadow-lg hover:shadow-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setSelectedPost(news);
                          }}
                        >
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </Button>
                      </CardContent>

                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                    </Card>
                  </AnimatedText>)}
              </div>

              {/* Call to action */}
              <AnimatedText delay={1000} className="text-center mt-8">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <Link to="/blog">
                    View All Updates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </AnimatedText>
            </div>
          </section>
        </ScrollAnimated>}

      {/* Client Stories Section */}
      <ScrollAnimated>
        <TestimonialsSection />
      </ScrollAnimated>

      {/* Get in Touch CTA */}
      <ScrollAnimated>
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
      </ScrollAnimated>
      
      {/* Blog Post Modal - REDESIGNED */}
      <Dialog open={selectedPost !== null} onOpenChange={(open) => {
        if (!open) setSelectedPost(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 via-background/50 to-secondary/10 backdrop-blur-xl">
          {selectedPost && (
            <>
              {/* Left Column: Image */}
              <div className="relative md:col-span-1 h-64 md:h-full">
                {selectedPost.image_url && (
                  <img
                    src={selectedPost.image_url}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover rounded-t-lg md:rounded-l-2xl md:rounded-t-none"
                  />
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              {/* Right Column: Content */}
              <div className="md:col-span-1 flex flex-col p-6 md:p-8">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-3xl font-bold text-foreground mb-3">
                    {selectedPost.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{new Date(selectedPost.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                     <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{new Date(selectedPost.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{selectedPost.location || 'Virtual Event'}</span>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="flex-grow overflow-y-auto pr-2 text-base leading-relaxed text-foreground whitespace-pre-wrap mb-6">
                  {selectedPost.content}
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/10">
                   <Button
                    variant="ghost"
                    className="group/btn p-0 h-auto font-medium text-primary hover:text-primary"
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                  >
                    <Share2 className="mr-2 h-4 w-4"/>
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="glassmorphism-btn rounded-lg"
                    onClick={() => setSelectedPost(null)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  </Layout>;
};
export default Index;
