import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useHeroBanners, useServices, useRentals, useTrustedClients, useNewsAchievements, useAboutContent, usePortfolio, useEvents } from "@/hooks/useData";
import { ArrowRight, Sparkles, Clock, Users, Award, Heart, Calendar, MapPin, Share2, Trophy, Star, User, Target, Eye, Camera, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import InquiryForm from "@/components/Forms/InquiryForm";
import { AnimatedText, GradientText } from "@/components/ui/animated-text";
import Layout from "@/components/Layout/Layout";
import TestimonialsSection from "@/components/TestimonialsSection";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { HeroSection } from "@/components/ui/hero-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GlassmorphismCard } from "@/components/ui/glassmorphism-card";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";
import { CursorTrail } from "@/components/ui/cursor-trail";
import { TiltCard } from "@/components/ui/tilt-card";
import { Ticker, TickerItem } from "@/components/ui/ticker-animation";
import { CardStack } from "@/components/ui/card-stack";
import { StatsContainer, StatCard } from "@/components/ui/elegant-stats";
import { OptimizedImage } from "@/components/ui/optimized-image";

// Enhanced scroll animation component
const ScrollAnimated = ({
  children,
  className = '',
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);
  return <div ref={ref} className={`${className} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
      {children}
    </div>;
};

// Enhanced animated stat component
const AnimatedStat = ({
  finalValue,
  suffix = '',
  isDecimal = false,
  prefix = ''
}) => {
  const [count, setCount] = useState(isDecimal ? 0.0 : 0);
  const ref = useRef(null);
  const duration = 2500;
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const startTime = performance.now();
        const animate = currentTime => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentCount = easeOutQuart * finalValue;
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
    }, {
      threshold: 0.5
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [finalValue, isDecimal, duration]);
  return <span ref={ref} className="font-bold text-4xl lg:text-5xl text-gradient-primary">
      {prefix}{isDecimal ? count.toFixed(1) : count.toLocaleString()}{suffix}
    </span>;
};

// Premium icon components
const StatIcon = ({
  icon: Icon,
  className = ""
}) => <div className={`relative p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 ${className}`}>
    <Icon className="h-8 w-8 text-primary animate-pulse-glow" />
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 blur-md opacity-50" />
  </div>;
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
  const {
    data: aboutContent,
    isLoading: loadingAbout
  } = useAboutContent();
  const {
    data: portfolio,
    isLoading: loadingPortfolio
  } = usePortfolio();
  const {
    data: events,
    isLoading: loadingEvents
  } = useEvents();
  const [selectedRental, setSelectedRental] = useState(null);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const isLoading = loadingBanners || loadingServices || loadingRentals || loadingClients || loadingNews || loadingAbout || loadingPortfolio || loadingEvents;

  // Filter data for home page display
  const homeServices = services?.filter(service => service.show_on_home && service.is_active) || [];
  const homeRentals = rentals?.filter(rental => rental.show_on_home && rental.is_active) || [];
  const activeClients = trustedClients?.filter(client => client.is_active) || [];
  const homeNews = newsAchievements?.filter(news => news.show_on_home && news.is_active) || [];
  const activeBanners = heroBanners?.filter(banner => banner.is_active) || [];
  const homePortfolio = portfolio?.filter(item => item.show_on_home !== false)?.slice(0, 6) || [];
  if (isLoading) {
    return <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-4 border-accent/20 border-r-accent animate-spin" style={{
              animationDirection: 'reverse',
              animationDuration: '1.5s'
            }}></div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-medium text-foreground">Creating Excellence</p>
              <p className="text-muted-foreground">Preparing your premier experience...</p>
            </div>
          </div>
        </div>
      </Layout>;
  }
  return <Layout>
      <CursorTrail enabled={true} color="hsl(var(--primary))" />
      
      {/* Enhanced Hero Section with Dynamic Banners */}
        {activeBanners.length > 0 ? <CardStack cards={activeBanners.map((banner, index) => <HeroSection key={banner.id} backgroundImage={banner.image_url} className="relative overflow-hidden">
              <FloatingParticles count={12} size="sm" speed="slow" />
              
              <div className="container mx-auto px-4 text-center relative z-20">

                <ScrollReveal animation="scale-in" delay={400}>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                    <GradientText className="block">{banner.title || "Creating Extraordinary Experiences"}</GradientText>
                  </h1>
                </ScrollReveal>

                <ScrollReveal animation="fade-in-up" delay={600}>
                  <p className="text-2xl lg:text-3xl font-display mb-12 max-w-4xl mx-auto leading-relaxed font-medium tracking-wide text-stone-50">
                    {banner.subtitle || "Where vision meets execution. We transform your dreams into unforgettable moments with unparalleled attention to detail and sophisticated event management."}
                  </p>
                </ScrollReveal>

                <ScrollReveal animation="bounce-in" delay={800}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" className="group bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-secondary shadow-glow-blue hover:shadow-glow-red transition-all duration-300 px-8 py-4 text-lg font-semibold" asChild>
                      <Link to={`/events/${banner.event_type?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {banner.button_text || "Explore Services"}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="group backdrop-blur-sm bg-background/80 border-border/50 hover:bg-background/90 px-8 py-4 text-lg font-semibold" asChild>
                      <Link to="/portfolio">
                        View Portfolio
                        <Camera className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </ScrollReveal>
              </div>
            </HeroSection>)} autoPlay={true} interval={5000} className="h-screen" /> : <HeroSection backgroundImage="/assets/default-hero.jpg" className="relative overflow-hidden">
          <FloatingParticles count={12} size="sm" speed="slow" />
          
          <div className="container mx-auto px-4 text-center relative z-20">

            <ScrollReveal animation="scale-in" delay={400}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                <GradientText className="block">Creating</GradientText>
                <span className="block text-foreground">Extraordinary</span>
                <GradientText className="block">Experiences</GradientText>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fade-in-up" delay={600}>
              <p className="text-2xl lg:text-3xl text-primary font-display mb-12 max-w-4xl mx-auto leading-relaxed font-medium tracking-wide">
                Where vision meets execution. We transform your dreams into unforgettable moments 
                with unparalleled attention to detail and sophisticated event management.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="bounce-in" delay={800}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="group bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-secondary shadow-glow-blue hover:shadow-glow-red transition-all duration-300 px-8 py-4 text-lg font-semibold" asChild>
                  <Link to="/services">
                    Explore Services 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="group backdrop-blur-sm bg-background/80 border-border/50 hover:bg-background/90 px-8 py-4 text-lg font-semibold" asChild>
                  <Link to="/portfolio">
                    View Portfolio
                    <Camera className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </HeroSection>}

      {/* Event Management Stats Section */}
      <Section spacing="large">
        <ScrollReveal animation="fade-in-up">
          <StatsContainer>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
                The only platform that creates extraordinary
                <br />
                <span className="text-primary">& memorable events</span> with precision
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
              <StatCard number="500+" label="EVENTS MANAGED" />
              <StatCard number="50+" label="CORPORATE CLIENTS" />
              <StatCard number="5000+" label="SATISFIED GUESTS" />
              <StatCard number="100%" label="SUCCESS RATE" />
            </div>
          </StatsContainer>
        </ScrollReveal>
      </Section>

      {/* Enhanced Services Section */}
      <Section spacing="large">
        <div className="container mx-auto px-4">
          <SectionHeader badge={<Badge variant="outline"><Sparkles className="mr-2 h-4 w-4" />Premium Services</Badge>} title="Exceptional Event Management" description="From intimate gatherings to grand celebrations, we deliver sophistication and excellence in every detail." />
          
          <ScrollReveal animation="fade-in-up" stagger={200} childSelector=".service-card">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {homeServices.map((service, index) => <GlassmorphismCard key={service.id} className="service-card group p-6 hover:shadow-glow-blue" variant="subtle" glow>
                  <div className="space-y-4">
                    {service.image_url && <div className="relative overflow-hidden rounded-lg aspect-video">
                        <OptimizedImage src={service.image_url} alt={service.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {service.short_description}
                      </p>
                      <Button variant="ghost" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors p-0 h-auto font-semibold" asChild>
                        <Link to={`/events/${service.event_type.toLowerCase().replace(/\s+/g, '-')}`}>
                          Learn More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </GlassmorphismCard>)}
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* Premium About Section - Like "Let's Create Magic Together" */}
      {aboutContent && <Section variant="gradient" spacing="large">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal animation="fade-in-up">
              <div className="max-w-4xl mx-auto space-y-8">
                <Badge variant="secondary" className="mb-6 px-6 py-2">
                  <User className="mr-2 h-4 w-4" />
                  About Us
                </Badge>
                
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Start Planning Your
                  <GradientText className="block">Perfect Event?</GradientText>
                </h2>
                
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  Let's bring your vision to life with our expertise in creating unforgettable experiences. 
                  Contact us today to begin planning your extraordinary event.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="group bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-secondary shadow-glow-blue hover:shadow-glow-red transition-all duration-300 px-8 py-4 text-lg font-semibold" onClick={() => setInquiryDialogOpen(true)}>
                    Start Planning Today
                    <Calendar className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>
                  <Button variant="outline" size="lg" className="group backdrop-blur-sm bg-background/80 border-border/50 hover:bg-background/90 px-8 py-4 text-lg font-semibold" asChild>
                    <Link to="/about">
                      Learn About Us <ArrowRight className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Section>}

      {/* Enhanced Equipment Rental Section */}
      <Section spacing="large">
        <div className="container mx-auto px-4">
          <SectionHeader badge={<Badge variant="outline"><Award className="mr-2 h-4 w-4" />Premium Equipment</Badge>} title="Professional Event Rentals" description="High-quality equipment and furnishings to elevate your event experience with style and sophistication." />
          
          <ScrollReveal animation="fade-in-up" stagger={150} childSelector=".rental-card">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {homeRentals.map(rental => <GlassmorphismCard key={rental.id} className="rental-card group overflow-hidden hover:shadow-glow-blue" variant="default">
                  <div className="relative">
                     {rental.image_urls && rental.image_urls.length > 0 ? <MultiImageCarousel images={rental.image_urls} title={rental.title} className="aspect-video" /> : rental.image_url ? <div className="aspect-video relative overflow-hidden">
                        <OptimizedImage src={rental.image_url} alt={rental.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div> : <div className="aspect-video bg-muted flex items-center justify-center">
                        <Award className="h-12 w-12 text-muted-foreground" />
                      </div>}
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {rental.title}
                      </h3>
                      {rental.price_range && <Badge variant="secondary" className="font-medium">
                          {rental.price_range}
                        </Badge>}
                      <p className="text-muted-foreground leading-relaxed">
                        {rental.short_description}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 group-hover:border-primary group-hover:text-primary transition-colors" onClick={() => {
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
                </GlassmorphismCard>)}
            </div>
          </ScrollReveal>

          {homeRentals.length > 0 && <ScrollReveal animation="fade-in" delay={600}>
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" asChild>
                  <Link to="/ecommerce">
                    View All Equipment <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>}
        </div>
      </Section>

      {/* Premium Portfolio Section - Like "Let's Create Magic Together" */}
      {homePortfolio.length > 0 && <Section variant="muted" spacing="large">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal animation="fade-in-up">
              <div className="max-w-4xl mx-auto space-y-8">
                <Badge variant="secondary" className="mb-6 px-6 py-2">
                  <Camera className="mr-2 h-4 w-4" />
                  Our Portfolio
                </Badge>
                
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Showcasing Our
                  <GradientText className="block">Creative Excellence</GradientText>
                </h2>
                
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  Discover the artistry and innovation behind our most memorable events, 
                  where every detail tells a story of elegance and sophistication.
                </p>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                   {homePortfolio.map((item, index) => {
                const associatedEvent = events?.find(event => event.id === item.event_id);
                return <ScrollReveal key={item.id} animation="scale-in" delay={index * 100}>
                         <TiltCard tiltDegree={15} scale={1.02} glareEnable={true} className="overflow-hidden rounded-lg">
                           <GlassmorphismCard className="group overflow-hidden hover:shadow-glow-blue h-full">
                             <div className="relative">
                                <div className="aspect-square relative overflow-hidden">
                                  <OptimizedImage src={item.image_url} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                 <div className="p-4 text-white">
                                   <h3 className="font-bold text-lg">{item.title}</h3>
                                   {associatedEvent && <p className="text-sm opacity-90">{associatedEvent.event_type}</p>}
                                 </div>
                               </div>
                             </div>
                           </GlassmorphismCard>
                         </TiltCard>
                       </ScrollReveal>;
              })}
                 </div>
                
                <Button size="lg" variant="outline" className="group backdrop-blur-sm bg-background/80 border-border/50 hover:bg-background/90 px-8 py-4 text-lg font-semibold" asChild>
                  <Link to="/portfolio">
                    View Full Portfolio <Camera className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </Section>}

      {/* Enhanced Trusted Clients Section */}
      {activeClients.length > 0 && <Section spacing="large">
          <div className="container mx-auto px-4">
            <SectionHeader badge={<Badge variant="outline"><Users className="mr-2 h-4 w-4" />Trusted Partners</Badge>} title="Prestigious Clientele" description="Proud to serve leading organizations and distinguished clients across various industries." />
            
             <ScrollReveal animation="fade-in-up">
               <div className="relative overflow-hidden">
                 <Ticker direction="left" speed={40} pauseOnHover={true}>
                   {activeClients.map((client, index) => <TickerItem key={client.id} className="mx-8">
                       <TiltCard tiltDegree={10} scale={1.05} glareEnable={true} className="flex-shrink-0">
                         <GlassmorphismCard className="p-6 hover:shadow-lg transition-all duration-300">
                             <OptimizedImage src={client.logo_url} alt={client.name} loading="lazy" className="h-16 w-auto mx-auto filter grayscale hover:grayscale-0 transition-all duration-300" onError={() => {
                      console.error('Failed to load client logo:', client.logo_url);
                    }} />
                         </GlassmorphismCard>
                       </TiltCard>
                     </TickerItem>)}
                 </Ticker>
               </div>
             </ScrollReveal>
          </div>
        </Section>}


      {/* Premium Testimonials Section */}
      <Section variant="gradient" spacing="large">
        <div className="container mx-auto px-4">
          
          <ScrollReveal animation="scale-in">
            <TestimonialsSection />
          </ScrollReveal>
        </div>
      </Section>

      {/* Enhanced Awards & News Section */}
      {homeNews.length > 0 && <Section spacing="large">
          <div className="container mx-auto px-4">
            <SectionHeader badge={<Badge variant="outline"><Trophy className="mr-2 h-4 w-4" />Achievements</Badge>} title="Awards & Recognition" description="Celebrating our commitment to excellence and industry leadership." />
            
            <ScrollReveal animation="fade-in-up" stagger={200} childSelector=".news-card">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {homeNews.map(news => <GlassmorphismCard key={news.id} className="news-card group hover:shadow-glow-blue" variant="default">
                     {news.image_url && <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <OptimizedImage src={news.image_url} alt={news.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>}
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {news.short_content}
                      </p>
                      <Button variant="ghost" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors p-0 h-auto font-semibold" asChild>
                        <Link to={`/blog/${news.id}`}>
                          Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </GlassmorphismCard>)}
              </div>
            </ScrollReveal>
          </div>
        </Section>}

      {/* Premium CTA Section */}
      <Section variant="gradient" spacing="large">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal animation="fade-in-up">
            <div className="max-w-4xl mx-auto space-y-8">
              <Badge variant="secondary" className="mb-6 px-6 py-2">
                <Heart className="mr-2 h-4 w-4" />
                Let's Create Magic Together
              </Badge>
              
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Create Your
                <GradientText className="block">Dream Event?</GradientText>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                From conceptualization to execution, we're here to transform your vision into an 
                extraordinary experience that exceeds every expectation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="group bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-secondary shadow-glow-blue hover:shadow-glow-red transition-all duration-300 px-8 py-4 text-lg font-semibold" onClick={() => setInquiryDialogOpen(true)}>
                  Start Planning 
                  <Calendar className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="group backdrop-blur-sm bg-background/80 border-border/50 hover:bg-background/90 px-8 py-4 text-lg font-semibold" asChild>
                  <Link to="/portfolio">
                    View Our Work
                    <Camera className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* Enhanced Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {selectedRental ? `Inquire About ${selectedRental.title}` : 'Event Inquiry'}
            </DialogTitle>
          </DialogHeader>
          <InquiryForm formType={selectedRental ? "rental" : "inquiry"} title={selectedRental ? `${selectedRental.title} Inquiry` : "General Inquiry"} rentalId={selectedRental?.id} rentalTitle={selectedRental?.title} onSuccess={() => {
          setInquiryDialogOpen(false);
          setSelectedRental(null);
        }} />
        </DialogContent>
      </Dialog>
    </Layout>;
};
export default Index;