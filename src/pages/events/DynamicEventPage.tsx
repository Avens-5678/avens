import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout/Layout";
import { useEvent, usePortfolio } from "@/hooks/useData";
import { Briefcase, ArrowRight, Camera, ExternalLink, Star, Users, Calendar, Zap, Target, Building, Mic, Monitor, Layout as LayoutIcon } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";
import FloatingParticles from "@/components/ui/floating-particles";
import MagneticButton from "@/components/ui/magnetic-button";
import GlassmorphismCard from "@/components/ui/glassmorphism-card";
import InteractiveGrid from "@/components/ui/interactive-grid";

const iconMap = {
  star: Star,
  users: Users,
  calendar: Calendar,
  zap: Zap,
  briefcase: Briefcase,
  target: Target,
  building: Building,
  mic: Mic,
  monitor: Monitor,
  layout: LayoutIcon,
};

const DynamicEventPage = () => {
  const { eventType } = useParams<{ eventType: string }>();
  const { data: event, isLoading } = useEvent(eventType || "");
  const { data: portfolio } = usePortfolio();

  const eventPortfolio = portfolio?.filter(item => 
    item.event_id === event?.id || 
    item.tag?.toLowerCase().includes(eventType?.toLowerCase() || '')
  )?.slice(0, 3);

  // Parse JSON fields properly
  const parseJSONField = (field: any) => {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (e) {
        console.error('Error parsing JSON field:', e, field);
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  };

  const specialties = parseJSONField(event?.specialties);
  const services = parseJSONField(event?.services);
  const processSteps = parseJSONField(event?.process_steps);

  // Debug logging
  console.log('Event data:', event);
  console.log('Parsed specialties:', specialties);
  console.log('Parsed services:', services);
  console.log('Parsed processSteps:', processSteps);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading event details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Event Not Found</h1>
            <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
            <Link to="/services">
              <Button>View All Services</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Enhanced Hero Section with Particles */}
      <section className="relative min-h-screen flex items-center overflow-hidden particles-container py-8 md:py-12 lg:py-16 px-4 sm:px-6 md:px-8">
        <FloatingParticles count={30} colors={['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))']} />
        
        {/* Morphing Background Elements */}
        <div className="absolute top-10 sm:top-20 right-4 sm:right-20 w-48 sm:w-96 h-48 sm:h-96 animate-morphing-bg opacity-30 pointer-events-none" />
        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-20 w-40 sm:w-80 h-40 sm:h-80 animate-morphing-bg opacity-20 pointer-events-none" style={{ animationDelay: '4s' }} />
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Hero Image - Shows first on mobile, second on desktop */}
            <ScrollReveal animation="rotate-in" delay={500} className="lg:w-1/2 w-full order-1 lg:order-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl lg:rounded-3xl blur-2xl lg:blur-3xl group-hover:blur-xl lg:group-hover:blur-2xl transition-all duration-500" />
                <GlassmorphismCard variant="subtle" className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-1 lg:p-2">
                  <img 
                    src={event.hero_image_url || "/placeholder-event.jpg"}
                    alt={`${event.title} setup`}
                    className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[600px] object-cover rounded-xl lg:rounded-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-2 lg:top-4 right-2 lg:right-4">
                    <div className="glass p-2 lg:p-3 rounded-full">
                      <Briefcase className="h-4 w-4 lg:h-6 lg:w-6 text-primary animate-glow" />
                    </div>
                  </div>
                </GlassmorphismCard>
                
                {/* Floating Icons - Hidden on mobile */}
                <div className="hidden sm:block absolute -top-2 lg:-top-4 -left-2 lg:-left-4 animate-float">
                  <div className="glass p-2 lg:p-4 rounded-full shadow-2xl">
                    <Briefcase className="h-4 w-4 lg:h-8 lg:w-8 text-accent" />
                  </div>
                </div>
                <div className="hidden sm:block absolute -bottom-2 lg:-bottom-4 -right-2 lg:-right-4 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="glass p-2 lg:p-4 rounded-full shadow-2xl">
                    <Briefcase className="h-4 w-4 lg:h-8 lg:w-8 text-primary" />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Hero Content - Shows second on mobile, first on desktop */}
            <ScrollReveal animation="fade-in-up" delay={200} className="lg:w-1/2 space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1 px-2 sm:px-4 lg:px-0">
              <Badge variant="secondary" className="glass bg-primary/10 text-primary border-primary/20 w-fit hover-glow mx-auto lg:mx-0">
                <Briefcase className="mr-2 h-4 w-4 animate-pulse-glow" />
                {event.title}
              </Badge>
              
               <ScrollReveal animation="bounce-in" delay={400}>
                 <div className="space-y-3 sm:space-y-4 lg:space-y-6 px-2 sm:px-4 lg:px-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                      <span className="block">{event.title}</span>
                      <span className="block text-gradient-primary animate-gradient-text mt-1 sm:mt-2">
                        Excellence
                      </span>
                    </h1>
                   
                   {event.hero_subtitle && (
                     <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                       {event.hero_subtitle}
                     </p>
                   )}
                   
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                      {event.description}
                    </p>
                 </div>
               </ScrollReveal>

              <ScrollReveal animation="elastic" delay={600}>
                <MagneticButton 
                  size="lg" 
                  className="button-primary px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold rounded-full shadow-2xl w-full sm:w-auto"
                  asChild
                >
                  <Link to={`/client/dashboard?tab=request&type=${event.url_slug || event.event_type.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Briefcase className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                    Plan My {event.title}
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </Link>
                </MagneticButton>
              </ScrollReveal>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 particles-container opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <ScrollReveal animation="fade-in-up" className="text-center max-w-4xl mx-auto space-y-6 lg:space-y-8 mb-12 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              {event.what_we_do_title || 'What We Do'}
              <span className="block text-gradient-secondary mt-2">For Your Special Event</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed px-4">
              {event.process_description || "Our expert team provides comprehensive event planning and management services tailored to your unique needs."}
            </p>
          </ScrollReveal>

          {/* Event Specialties with Interactive Grid */}
          {specialties.length > 0 && (
            <InteractiveGrid columns={3} gap="lg" staggerDelay={150} animation="bounce-in">
              {specialties.map((specialty, index) => (
                <div key={index} className="grid-item">
                  <GlassmorphismCard 
                    variant="default" 
                    hover={true} 
                    glow={true}
                    className="card-interactive group overflow-hidden h-full"
                  >
                    {specialty.image_url && (
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={specialty.image_url}
                          alt={specialty.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                          <Briefcase className="h-4 w-4 sm:h-6 sm:w-6 text-white animate-twinkle" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4 sm:p-6 lg:p-8 text-center bg-background/90 backdrop-blur-sm">
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-gradient-primary">{specialty.title}</h4>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{specialty.description}</p>
                    </CardContent>
                  </GlassmorphismCard>
                </div>
              ))}
            </InteractiveGrid>
          )}
        </div>
      </section>

      {/* Enhanced Services Section */}
      {services.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-36 sm:w-72 h-36 sm:h-72 bg-primary/10 rounded-full blur-2xl sm:blur-3xl animate-float" />
            <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-accent/10 rounded-full blur-2xl sm:blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>
          
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Enhanced Curved Text Title */}
              <ScrollReveal animation="rotate-in" delay={200} className="lg:w-2/5 text-center lg:text-left">
                <div className="relative">
                  <div className="transform hover:rotate-0 transition-transform duration-700 lg:-rotate-12 lg:origin-left">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gradient-primary leading-tight">
                      {event.title}
                      <br />
                      <span className="text-gradient-secondary">Services</span>
                    </h2>
                    <div className="mt-4 flex justify-center lg:justify-start">
                      <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-accent animate-glow" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Enhanced Services List */}
              <ScrollReveal animation="slide-in-left" delay={400} className="lg:w-3/5 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-4 lg:space-y-6">
                    {services.slice(0, Math.ceil(services.length / 2)).map((service, index) => {
                      const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Star;
                      return (
                        <ScrollReveal 
                          key={index} 
                          animation="fade-in-up" 
                          delay={600 + (index * 100)}
                          className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer"
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                          <span className="text-base sm:text-lg lg:text-xl font-medium group-hover:text-primary transition-colors duration-300">
                            {service.title}
                          </span>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                  <div className="space-y-4 lg:space-y-6">
                    {services.slice(Math.ceil(services.length / 2)).map((service, index) => {
                      const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Star;
                      return (
                        <ScrollReveal 
                          key={index} 
                          animation="fade-in-up" 
                          delay={800 + (index * 100)}
                          className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer"
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                          <span className="text-base sm:text-lg lg:text-xl font-medium group-hover:text-accent transition-colors duration-300">
                            {service.title}
                          </span>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}

      {/* Our Process */}
      {processSteps.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
          <FloatingParticles count={15} size="sm" speed="slow" className="opacity-30" />
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal animation="bounce-in" delay={200} className="text-center mb-12 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 lg:mb-6">
                Our Process
                <span className="block text-gradient-primary">Excellence</span>
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                From your first conversation to the final moment, we guide you through every step of creating your perfect {event.title} experience.
              </p>
            </ScrollReveal>

            <InteractiveGrid columns={3} gap="lg" staggerDelay={200} animation="scale-in">
              {processSteps.sort((a, b) => a.order - b.order).map((step, index) => {
                const IconComponent = iconMap[step.icon as keyof typeof iconMap] || Star;
                return (
                  <div key={index} className="grid-item text-center space-y-4 lg:space-y-6 group">
                    <ScrollReveal animation="bounce-in" delay={400 + (index * 200)}>
                      <div className="relative mx-auto mb-6 lg:mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500 animate-glow-border" style={{ animationDelay: `${index}s` }}>
                          <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                        </div>
                        <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">{index + 1}</span>
                        </div>
                      </div>
                    </ScrollReveal>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient-primary px-2">{step.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </InteractiveGrid>
          </div>
        </section>
      )}

      {/* Portfolio Showcase */}
      {eventPortfolio && eventPortfolio.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal animation="fade-in-up" delay={200} className="text-center mb-12 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 lg:mb-6">
                Recent Success Stories
                <span className="block text-gradient-secondary mt-2">From Our Portfolio</span>
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                See how we've transformed visions into unforgettable {event.title} experiences
              </p>
            </ScrollReveal>

            <InteractiveGrid columns={3} gap="lg" staggerDelay={150} animation="fade-in-up">
              {eventPortfolio.map((item, index) => (
                <div key={item.id} className="grid-item">
                  <GlassmorphismCard 
                    variant="default" 
                    hover={true}
                    className="group overflow-hidden h-full"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <CardContent className="p-4 sm:p-6 bg-background/90 backdrop-blur-sm">
                      <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
                      {item.tag && (
                        <Badge variant="secondary" className="text-xs">
                          {item.tag}
                        </Badge>
                      )}
                    </CardContent>
                  </GlassmorphismCard>
                </div>
              ))}
            </InteractiveGrid>

            <div className="text-center mt-12 lg:mt-16">
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link to="/portfolio">
                  View Our Complete Portfolio <ExternalLink className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced CTA Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 relative overflow-hidden">
        <FloatingParticles count={20} colors={['hsl(var(--primary))', 'hsl(var(--accent))']} className="opacity-60" />
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10">
          <ScrollReveal animation="bounce-in" delay={200} className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {event.cta_title?.split(' ').slice(0, -1).join(' ') || 'Ready to Create Something'}
              <span className="block text-gradient-primary animate-gradient-text">
                {event.cta_title?.split(' ').slice(-1)[0] || 'Amazing Together?'}
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto px-4">
              {event.cta_description || "Let's discuss your vision and create an unforgettable experience that exceeds your expectations."}
            </p>

            <ScrollReveal animation="elastic" delay={400} className="pt-4 lg:pt-6">
              <MagneticButton 
                size="lg" 
                className="button-primary px-8 sm:px-10 lg:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-full shadow-2xl w-full sm:w-auto"
                asChild
              >
                <Link to={`/client/dashboard?tab=request&type=${event.url_slug || event.event_type.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Calendar className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  {event.cta_button_text || 'Book a Consultation'}
                  <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                </Link>
              </MagneticButton>
            </ScrollReveal>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default DynamicEventPage;