import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useEvent, usePortfolio } from "@/hooks/useData";
import { Briefcase, ArrowRight, Camera, ExternalLink, Star, Users, Calendar, Zap } from "lucide-react";
import AnimatedSection from "@/components/ui/animated-section";

const iconMap = {
  star: Star,
  users: Users,
  calendar: Calendar,
  zap: Zap,
};

const DynamicEventPage = () => {
  const { eventType } = useParams<{ eventType: string }>();
  const { data: event, isLoading } = useEvent(eventType || "");
  const { data: portfolio } = usePortfolio();

  const eventPortfolio = portfolio?.filter(item => 
    item.event_id === event?.id || 
    item.tag?.toLowerCase().includes(eventType?.toLowerCase() || '')
  )?.slice(0, 3);

  const specialties = (event?.specialties as any[]) || [];
  const services = (event?.services as any[]) || [];
  const processSteps = (event?.process_steps as any[]) || [];

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
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimatedSection animation="fade-in-up" delay={0.1} className="lg:w-1/2 space-y-8">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 w-fit">
                <Briefcase className="mr-2 h-4 w-4" />
                {event.title}
              </Badge>
              
               <AnimatedSection animation="fade-in-up" delay={0.3}>
                 <div className="space-y-6">
                   <h1 className="text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                     {event.title}
                     {!event.hero_subtitle && <span className="block bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Excellence</span>}
                   </h1>
                   
                   {event.hero_subtitle && (
                     <p className="text-2xl font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                       {event.hero_subtitle}
                     </p>
                   )}
                   
                   <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                     {event.description}
                   </p>
                 </div>
               </AnimatedSection>

               <AnimatedSection animation="scale-in" delay={0.5}>
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button size="lg" className="bg-primary text-primary-foreground px-8">
                       {event.hero_cta_text || 'Book a Consultation'} <ArrowRight className="ml-2 h-5 w-5" />
                     </Button>
                   </DialogTrigger>
                 <DialogContent className="w-[90vw] max-w-sm sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0">
                   <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                     <InquiryForm 
                       formType="inquiry"
                       eventType={event.event_type}
                       title="Book Consultation"
                     />
                   </div>
                 </DialogContent>
               </Dialog>
               </AnimatedSection>
            </AnimatedSection>

            <AnimatedSection animation="slide-in-right" delay={0.4} className="lg:w-1/2">
              <div className="relative">
                <img 
                  src={event.hero_image_url || "/placeholder-event.jpg"}
                  alt={event.title}
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full animate-float"></div>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/30 rounded-full animate-float-delayed"></div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold">{event.what_we_do_title || 'What We Do'}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {event.process_description || "Our expert team provides comprehensive event planning and management services tailored to your unique needs."}
            </p>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      {specialties.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Our Specialties</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {specialties.map((specialty, index) => (
                <Card key={index} className="overflow-hidden">
                  {specialty.image_url && (
                    <div className="aspect-video relative">
                      <img 
                        src={specialty.image_url} 
                        alt={specialty.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{specialty.title}</h3>
                    <p className="text-muted-foreground">{specialty.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              {event.services_section_title || 'Our Services'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Star;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Our Process */}
      {processSteps.length > 0 && (
        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Process</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {processSteps.sort((a, b) => a.order - b.order).map((step, index) => {
                const IconComponent = iconMap[step.icon as keyof typeof iconMap] || Star;
                return (
                  <div key={index} className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Showcase */}
      {eventPortfolio && eventPortfolio.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Recent {event.title} Success Stories
              </h2>
              <p className="text-xl text-muted-foreground">
                See how we've brought visions to life
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {eventPortfolio.map((item) => (
                <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-500">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                    {item.tag && (
                      <Badge variant="secondary" className="text-xs">
                        {item.tag}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg" asChild>
                <Link to="/portfolio">
                  View Our Complete Portfolio <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Create Something
              <span className="block text-primary">Amazing Together?</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Let's discuss your vision and create an unforgettable experience that exceeds your expectations.
            </p>

            <div className="pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-primary text-primary-foreground px-8 py-4 text-lg">
                    Book a Consultation
                  </Button>
                </DialogTrigger>
                 <DialogContent className="w-[90vw] max-w-sm sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0">
                   <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                     <InquiryForm 
                       formType="inquiry"
                       eventType={event.event_type}
                       title="Book Consultation"
                     />
                   </div>
                 </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DynamicEventPage;