import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useEvent, usePortfolio } from "@/hooks/useData";
import { Briefcase, ArrowRight, Camera, ExternalLink, Lightbulb, Zap, Award } from "lucide-react";

const DynamicEventPage = () => {
  const { eventType } = useParams<{ eventType: string }>();
  const { data: event, isLoading } = useEvent(eventType || "");
  const { data: portfolio } = usePortfolio();

  const eventPortfolio = portfolio?.filter(item => 
    item.event_id === event?.id || 
    item.tag?.toLowerCase().includes(eventType?.toLowerCase() || '')
  )?.slice(0, 3);

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
            {/* Content Side */}
            <div className="lg:w-1/2 space-y-8">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 w-fit">
                <Briefcase className="mr-2 h-4 w-4" />
                {event.title}
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  {event.title}
                  <span className="block text-primary">Excellence</span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  {event.description}
                </p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-primary text-primary-foreground px-8">
                    Book a Consultation <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Book {event.title} Consultation</DialogTitle>
                  </DialogHeader>
                  <InquiryForm 
                    formType="inquiry"
                    eventType={event.event_type}
                    title="Book Consultation"
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Image Side */}
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src={event.hero_image_url || "/placeholder-event.jpg"}
                  alt={event.title}
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full"></div>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold">What We Do</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {event.process_description || "Our expert team provides comprehensive event planning and management services tailored to your unique needs."}
            </p>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Process</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 1: Consultation</h3>
              <p className="text-muted-foreground leading-relaxed">
                We begin with a detailed consultation to understand your vision, requirements, and budget for the perfect event.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 2: Planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our team creates a comprehensive plan with timelines, vendor coordination, and detailed logistics management.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 3: Execution</h3>
              <p className="text-muted-foreground leading-relaxed">
                We handle every detail on event day, ensuring flawless execution while you enjoy your special occasion.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Book {event.title} Consultation</DialogTitle>
                  </DialogHeader>
                  <InquiryForm 
                    formType="inquiry"
                    eventType={event.event_type}
                    title="Book Consultation"
                  />
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