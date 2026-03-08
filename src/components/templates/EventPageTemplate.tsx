import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useDashboardPath } from "@/hooks/useDashboardPath";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout/Layout";
import ScrollReveal from "@/components/ui/scroll-reveal";
import FloatingParticles from "@/components/ui/floating-particles";
import MagneticButton from "@/components/ui/magnetic-button";
import GlassmorphismCard from "@/components/ui/glassmorphism-card";
import InteractiveGrid from "@/components/ui/interactive-grid";
import { ArrowRight, ExternalLink, LucideIcon } from "lucide-react";

interface EventSpecialty {
  title: string;
  image: string;
  description: string;
}

interface EventService {
  icon: LucideIcon;
  text: string;
}

interface ProcessStep {
  icon: LucideIcon;
  title: string;
  description: string;
  number: number;
}

interface PortfolioItem {
  id: string;
  title: string;
  image_url: string;
  tag?: string;
}

interface EventPageTemplateProps {
  // Basic Info
  eventType: string;
  eventTitle: string;
  heroSubtitle: string;
  description: string;
  heroImage: string;
  eventIcon: LucideIcon;
  
  // Content
  eventSpecialties: EventSpecialty[];
  leftServices: EventService[];
  rightServices: EventService[];
  processSteps: ProcessStep[];
  portfolioItems?: PortfolioItem[];
  
  // Customization
  primaryColor?: string;
  gradientColors?: [string, string];
  particleColors?: string[];
  
  // CTA
  ctaTitle: string;
  ctaSubtitle?: string;
  ctaDescription: string;
  
  // Loading state
  isLoading?: boolean;
}

export const EventPageTemplate = ({
  eventType,
  eventTitle,
  heroSubtitle,
  description,
  heroImage,
  eventIcon: EventIcon,
  eventSpecialties,
  leftServices,
  rightServices,
  processSteps,
  portfolioItems,
  primaryColor = "hsl(var(--primary))",
  gradientColors = ["hsl(var(--primary))", "hsl(var(--accent))"],
  particleColors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))'],
  ctaTitle,
  ctaSubtitle,
  ctaDescription,
  isLoading = false
}: EventPageTemplateProps) => {
  
  const { getServiceRequestPath } = useDashboardPath();
  
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading {eventType} services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Enhanced Hero Section with Particles */}
      <section className="relative min-h-screen flex items-center overflow-hidden particles-container">
        <FloatingParticles count={30} colors={particleColors} />
        
        {/* Morphing Background Elements */}
        <div className="absolute top-20 right-20 w-96 h-96 animate-morphing-bg opacity-30 pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-80 h-80 animate-morphing-bg opacity-20 pointer-events-none" style={{ animationDelay: '4s' }} />
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">
            <ScrollReveal animation="fade-in-up" delay={200} className="lg:w-1/2 space-y-4 md:space-y-6 lg:space-y-8">
              <Badge variant="secondary" className="glass bg-primary/10 text-primary border-primary/20 w-fit hover-glow">
                <EventIcon className="mr-2 h-4 w-4 animate-pulse-glow" />
                {eventTitle}
              </Badge>
              
              <ScrollReveal animation="bounce-in" delay={400}>
                <div className="space-y-3 md:space-y-4 lg:space-y-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                    {heroSubtitle.split(' ').slice(0, -1).join(' ')}
                    <span className="block text-gradient-primary animate-gradient-text">
                      {heroSubtitle.split(' ').slice(-1)[0]}
                    </span>
                  </h1>
                  
                  <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                    {description}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="elastic" delay={600}>
                <MagneticButton 
                  size="lg" 
                  className="button-primary px-6 md:px-8 lg:px-12 py-3 md:py-4 text-sm md:text-base lg:text-lg font-semibold rounded-full shadow-2xl"
                  strength={15}
                  asChild
                >
                  <Link to={getServiceRequestPath(eventType.toLowerCase().replace(/\s+/g, '-'))}>
                    <EventIcon className="mr-2 h-5 w-5" />
                    Plan My {eventTitle}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </MagneticButton>
              </ScrollReveal>
            </ScrollReveal>

            <ScrollReveal animation="rotate-in" delay={500} className="lg:w-1/2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500" />
                <GlassmorphismCard variant="subtle" className="relative overflow-hidden rounded-3xl p-2">
                  <img 
                    src={heroImage}
                    alt={`${eventTitle} setup`}
                    className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="glass p-3 rounded-full">
                      <EventIcon className="h-6 w-6 text-primary animate-glow" />
                    </div>
                  </div>
                </GlassmorphismCard>
                
                {/* Floating Icons */}
                <div className="absolute -top-4 -left-4 animate-float">
                  <div className="glass p-4 rounded-full shadow-2xl">
                    <EventIcon className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="glass p-4 rounded-full shadow-2xl">
                    <EventIcon className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 particles-container opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <ScrollReveal animation="fade-in-up" className="text-center max-w-4xl mx-auto space-y-8 mb-20">
            <h2 className="text-5xl font-bold">
              What We Do
              <span className="block text-gradient-secondary mt-2">For Your Special Event</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              At Evnting, we specialize in creating {eventType} experiences that are tailored to your unique vision. From planning to execution, 
              we handle every detail so you can focus on celebrating your special occasion.
            </p>
          </ScrollReveal>

          {/* Event Specialties with Interactive Grid */}
          <InteractiveGrid columns={3} gap="lg" staggerDelay={150} animation="bounce-in">
            {eventSpecialties.map((specialty, index) => (
              <div key={index} className="grid-item">
                <GlassmorphismCard 
                  variant="default" 
                  hover={true} 
                  glow={true}
                  className="card-interactive group overflow-hidden h-full"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      src={specialty.image}
                      alt={specialty.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <EventIcon className="h-6 w-6 text-white animate-twinkle" />
                    </div>
                  </div>
                  <CardContent className="p-8 text-center bg-background/90 backdrop-blur-sm">
                    <h4 className="text-2xl font-bold mb-4 text-gradient-primary">{specialty.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{specialty.description}</p>
                  </CardContent>
                </GlassmorphismCard>
              </div>
            ))}
          </InteractiveGrid>
        </div>
      </section>

      {/* Highlighted Services */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20">
            {/* Enhanced Curved Text Title */}
            <ScrollReveal animation="rotate-in" delay={200} className="lg:w-2/5">
              <div className="relative">
                <div className="transform -rotate-12 origin-left hover:rotate-0 transition-transform duration-700">
                  <h2 className="text-6xl lg:text-7xl font-bold text-gradient-primary leading-tight">
                    {eventTitle}
                    <br />
                    <span className="text-gradient-secondary">Services</span>
                  </h2>
                  <div className="mt-4">
                    <EventIcon className="h-12 w-12 text-accent animate-glow" />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Enhanced Services List */}
            <ScrollReveal animation="slide-in-left" delay={400} className="lg:w-3/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {leftServices.map((service, index) => (
                    <ScrollReveal 
                      key={index} 
                      animation="fade-in-up" 
                      delay={600 + (index * 100)}
                      className="flex items-center space-x-4 group cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <service.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xl font-medium group-hover:text-primary transition-colors duration-300">
                        {service.text}
                      </span>
                    </ScrollReveal>
                  ))}
                </div>
                <div className="space-y-6">
                  {rightServices.map((service, index) => (
                    <ScrollReveal 
                      key={index} 
                      animation="fade-in-up" 
                      delay={800 + (index * 100)}
                      className="flex items-center space-x-4 group cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <service.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xl font-medium group-hover:text-accent transition-colors duration-300">
                        {service.text}
                      </span>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
        <FloatingParticles count={15} size="sm" speed="slow" className="opacity-30" />
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <ScrollReveal animation="bounce-in" delay={200} className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              Our Process
              <span className="block text-gradient-primary">Excellence</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From your first conversation to the final moment, we guide you through every step of creating your perfect {eventType} experience.
            </p>
          </ScrollReveal>

          <InteractiveGrid columns={3} gap="lg" staggerDelay={200} animation="scale-in">
            {processSteps.map((step, index) => (
              <div key={index} className="grid-item text-center space-y-6 group">
                <ScrollReveal animation="bounce-in" delay={400 + (index * 200)}>
                  <div className="relative mx-auto mb-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500 animate-glow-border" style={{ animationDelay: `${index}s` }}>
                      <step.icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{step.number}</span>
                    </div>
                  </div>
                </ScrollReveal>
                <h3 className="text-2xl font-bold text-gradient-primary">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </InteractiveGrid>
        </div>
      </section>

      {/* Portfolio Showcase */}
      {portfolioItems && portfolioItems.length > 0 && (
        <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <ScrollReveal animation="fade-in-up" delay={200} className="text-center mb-20">
              <h2 className="text-5xl font-bold mb-6">
                Recent Success Stories
                <span className="block text-gradient-secondary mt-2">From Our Portfolio</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                See how we've transformed visions into unforgettable {eventType} experiences
              </p>
            </ScrollReveal>

            <InteractiveGrid columns={3} gap="lg" staggerDelay={150} animation="fade-in-up">
              {portfolioItems.map((item, index) => (
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
                    <CardContent className="p-6 bg-background/90 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
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

            <ScrollReveal animation="scale-in" delay={600} className="text-center mt-16">
              <MagneticButton variant="outline" size="lg" asChild strength={10}>
                <Link to="/portfolio">
                  View Our Complete Portfolio <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </MagneticButton>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 relative overflow-hidden">
        <FloatingParticles count={20} colors={particleColors} size="sm" className="opacity-40" />
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-10">
            <ScrollReveal animation="bounce-in" delay={200}>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                {ctaTitle}
                {ctaSubtitle && <span className="block text-gradient-primary mt-2">{ctaSubtitle}</span>}
              </h2>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-in-up" delay={400}>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                {ctaDescription}
              </p>
            </ScrollReveal>

            <ScrollReveal animation="elastic" delay={600}>
              <div className="pt-8">
                <MagneticButton 
                  size="lg" 
                  className="button-primary px-12 py-4 text-xl font-semibold rounded-full shadow-2xl"
                  strength={20}
                  asChild
                >
                  <Link to={getServiceRequestPath(eventType.toLowerCase().replace(/\s+/g, '-'))}>
                    <EventIcon className="mr-2 h-6 w-6" />
                    Start Planning Today
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventPageTemplate;