import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useEvent, usePortfolio } from "@/hooks/useData";
import { Briefcase, ArrowRight, Camera, ExternalLink, Users, Target, Trophy, Lightbulb, Zap, Award } from "lucide-react";
import corporateHero from "@/assets/corporate-events-hero.jpg";
const CorporateEvents = () => {
  const {
    data: event,
    isLoading
  } = useEvent("corporate");
  const {
    data: portfolio
  } = usePortfolio();
  const corporatePortfolio = portfolio?.filter(item => item.tag?.toLowerCase().includes('corporate') || item.tag?.toLowerCase().includes('business'))?.slice(0, 3);
  if (isLoading) {
    return <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading corporate services...</p>
          </div>
        </div>
      </Layout>;
  }
  const eventSpecialties = [{
    title: "Team Building",
    image: corporateHero,
    description: "Strengthen bonds through strategic experiences"
  }, {
    title: "Product Launches",
    image: corporateHero,
    description: "Memorable reveals that drive market impact"
  }, {
    title: "Executive Retreats",
    image: corporateHero,
    description: "Strategic gatherings for leadership alignment"
  }];
  return <Layout>
      {/* Lifestyle Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Content Side */}
            <div className="lg:w-1/2 space-y-8">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 w-fit">
                <Briefcase className="mr-2 h-4 w-4" />
                Corporate Events
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Elevating Business
                  <span className="block text-primary">Connections</span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  {event?.description || "At Chappelow Events, we pride ourselves in being an extension of your organization. Our team of experts service a wide variety of corporate events. Let us help you plan, design, and produce your next business gathering."}
                </p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8">
                    Book a Consultation <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Book Corporate Event Consultation</DialogTitle>
                  </DialogHeader>
                  <InquiryForm formType="inquiry" eventType="corporate" title="Book Consultation" />
                </DialogContent>
              </Dialog>
            </div>

            {/* Image Side */}
            <div className="lg:w-1/2">
              <div className="relative">
                <img src={corporateHero} alt="Corporate meeting with coffee and planning" className="w-full h-[500px] object-cover rounded-2xl shadow-2xl" />
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
              At Chappelow Events, we pride ourselves in being an extension of your organization. Our team of experts service a 
              wide variety of events. Let us help you plan, design, and produce your next gathering.
            </p>
          </div>

          {/* Event Specialties */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold mb-2">Our Corporate Event Specialties</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {eventSpecialties.map((specialty, index) => <Card key={index} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={specialty.image} alt={specialty.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <CardContent className="p-6 text-center bg-background">
                    <h4 className="text-xl font-semibold mb-3">{specialty.title}</h4>
                    <p className="text-muted-foreground text-sm">{specialty.description}</p>
                  </CardContent>
                </Card>)}
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
                  <h2 className="text-4xl lg:text-5xl font-bold text-primary leading-tight text-center">
                    Highlighted
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
                    <span className="text-lg">ROI Creation & Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Speaker & Stage Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Scripting</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Event Design</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Branding & Marketing Cultivation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Sponsor Cultivation & Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Travel & Hotel Facilitation</span>
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
                <Lightbulb className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 1: Introduction</h3>
              <p className="text-muted-foreground leading-relaxed">
                During our first consultation, we will learn about your organization, event goals, values, and trajectory. This is where we determine if we are the perfect fit.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 2: Customization</h3>
              <p className="text-muted-foreground leading-relaxed">
                Following our conversation, we will work on personalizing the perfect package for what your event needs. All clients start with our base services.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 3: Activation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Once the contract is signed, we launch into action! Breathe a sigh of relief - we are now in this together!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      {corporatePortfolio && corporatePortfolio.length > 0 && <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Recent Corporate Success Stories
              </h2>
              <p className="text-xl text-muted-foreground">
                See how we've transformed business visions into reality
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {corporatePortfolio.map(item => <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-500">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                    {item.tag && <Badge variant="secondary" className="text-xs">
                        {item.tag}
                      </Badge>}
                  </CardContent>
                </Card>)}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg" asChild>
                <Link to="/portfolio">
                  View Our Complete Portfolio <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Start Transforming Your
              <span className="block text-primary">Vision Into Reality</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              From concept to creation, our seasoned event planning team is ready to help you take the first step towards planning an unforgettable experience. Let us discuss your goals, make every detail count, & execute the perfect event that wows your guests.
            </p>

            <div className="pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 text-lg">
                    Book a Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Book Corporate Event Consultation</DialogTitle>
                  </DialogHeader>
                  <InquiryForm formType="inquiry" eventType="corporate" title="Book Consultation" />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>
    </Layout>;
};
export default CorporateEvents;