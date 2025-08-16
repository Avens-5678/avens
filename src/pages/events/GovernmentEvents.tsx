import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useEvent, usePortfolio } from "@/hooks/useData";
import { Building, ArrowRight, Camera, ExternalLink, Shield, Users, Award, Flag, Scale, Crown } from "lucide-react";
import governmentHero from "@/assets/government-events-hero.jpg";

const GovernmentEvents = () => {
  const { data: event, isLoading } = useEvent("government");
  const { data: portfolio } = usePortfolio();

  const governmentPortfolio = portfolio?.filter(item => 
    item.tag?.toLowerCase().includes('government') || 
    item.tag?.toLowerCase().includes('official') ||
    item.tag?.toLowerCase().includes('ceremony')
  )?.slice(0, 3);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading government services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const eventSpecialties = [
    {
      title: "State Ceremonies",
      image: governmentHero,
      description: "Official ceremonies with proper protocol and dignity"
    },
    {
      title: "Diplomatic Functions", 
      image: governmentHero,
      description: "International events requiring cultural sensitivity"
    },
    {
      title: "Public Engagements",
      image: governmentHero, 
      description: "Community events and public speaking engagements"
    }
  ];

  return (
    <Layout>
      {/* Lifestyle Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Content Side */}
            <div className="lg:w-1/2 space-y-8">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 w-fit">
                <Building className="mr-2 h-4 w-4" />
                Government Events
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Official Events
                  <span className="block text-primary">With Distinction</span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  {event?.description || "At Avens Events, we specialize in government and official events that require the highest standards of protocol, security, and professionalism. From state ceremonies to diplomatic functions, we ensure every detail meets official requirements."}
                </p>
              </div>

              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8">
                Plan Official Event <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Image Side */}
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src={governmentHero}
                  alt="Official government event setup"
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full opacity-20"></div>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-full opacity-30"></div>
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
              At Avens Events, we understand the unique requirements of government and official events. From security protocols to ceremonial procedures, 
              we ensure every aspect of your official function meets the highest standards of professionalism and dignity.
            </p>
          </div>

          {/* Event Specialties */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold mb-2">Our Government Event Specialties</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {eventSpecialties.map((specialty, index) => (
                <Card key={index} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={specialty.image}
                      alt={specialty.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <CardContent className="p-6 text-center bg-background">
                    <h4 className="text-xl font-semibold mb-3">{specialty.title}</h4>
                    <p className="text-muted-foreground text-sm">{specialty.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Services */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start gap-16">
            {/* Curved Text Title */}
            <div className="lg:w-1/3">
              <div className="relative">
                <div className="transform -rotate-12 origin-left">
                  <h2 className="text-4xl lg:text-5xl font-bold text-primary leading-tight">
                    Official
                    <br />
                    Services
                  </h2>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Protocol Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Security Coordination</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Ceremonial Planning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">VIP Guest Management</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Media & Press Coordination</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Diplomatic Relations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Official Documentation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">& So Much More</span>
                  </div>
                </div>
              </div>
            </div>
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
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Flag className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 1: Protocol Assessment</h3>
              <p className="text-muted-foreground leading-relaxed">
                We conduct thorough consultation to understand official requirements, security protocols, and ceremonial procedures specific to your government event.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Scale className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 2: Strategic Planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our experienced team creates detailed plans that comply with all official standards, security requirements, and diplomatic protocols.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 3: Flawless Execution</h3>
              <p className="text-muted-foreground leading-relaxed">
                We coordinate with all necessary agencies and officials to ensure your government event is executed with the dignity and professionalism it deserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      {governmentPortfolio && governmentPortfolio.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Government Event Portfolio
              </h2>
              <p className="text-xl text-muted-foreground">
                Professional execution of official government events and ceremonies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {governmentPortfolio.map((item) => (
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
                  View All Official Events <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Plan Your
              <span className="block text-primary">Official Event?</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Government events require special expertise and attention to protocol. Our experienced team understands the unique requirements of official functions and will ensure your event meets the highest standards of professionalism and dignity.
            </p>

            <div className="pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 text-lg">
                    Schedule Official Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogTitle className="sr-only">Schedule Official Consultation</DialogTitle>
                  <DialogDescription className="sr-only">Request a consultation for your government event</DialogDescription>
                  <InquiryForm 
                    formType="inquiry"
                    eventType="government"
                    title="Schedule Official Consultation"
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

export default GovernmentEvents;