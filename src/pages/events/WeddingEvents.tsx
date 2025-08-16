import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useEvent, usePortfolio } from "@/hooks/useData";
import { Heart, ArrowRight, Camera, ExternalLink, Crown, Flower, Diamond, Church, Heart as Ring, Calendar } from "lucide-react";
import weddingHero from "@/assets/wedding-events-hero.jpg";

const WeddingEvents = () => {
  const { data: event, isLoading } = useEvent("wedding");
  const { data: portfolio } = usePortfolio();

  const weddingPortfolio = portfolio?.filter(item => 
    item.tag?.toLowerCase().includes('wedding') || 
    item.tag?.toLowerCase().includes('bride')
  )?.slice(0, 3);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wedding services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const eventSpecialties = [
    {
      title: "Intimate Ceremonies",
      image: weddingHero,
      description: "Personal and heartfelt celebrations for close family"
    },
    {
      title: "Grand Celebrations", 
      image: weddingHero,
      description: "Luxurious weddings with every detail perfected"
    },
    {
      title: "Destination Weddings",
      image: weddingHero, 
      description: "Dream weddings in breathtaking locations"
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
                <Heart className="mr-2 h-4 w-4" />
                Wedding Events
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Your Love Story
                  <span className="block text-primary">Perfectly Told</span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  {event?.description || "At Avens Events, we believe every wedding should be as unique as your love story. From intimate ceremonies to grand celebrations, we craft unforgettable experiences that reflect your style and dreams."}
                </p>
              </div>

              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8">
                Plan My Wedding <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Image Side */}
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src={weddingHero}
                  alt="Beautiful wedding ceremony setup"
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
              At Avens Events, we specialize in creating wedding experiences that are as unique as your love story. From venue selection to day-of coordination, 
              we handle every detail so you can focus on celebrating your special day.
            </p>
          </div>

          {/* Event Specialties */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold mb-2">Our Wedding Specialties</h3>
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
                    Wedding
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
                    <span className="text-lg">Venue Selection & Booking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Vendor Coordination</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Floral Design & Decor</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-lg">Catering Management</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Timeline Creation & Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Day-of Coordination</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-lg">Guest Experience Management</span>
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
                <Church className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 1: Vision Discovery</h3>
              <p className="text-muted-foreground leading-relaxed">
                We start by understanding your love story, style preferences, and wedding dreams to create a personalized planning approach.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Ring className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 2: Design & Planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our team creates detailed plans, sources the perfect vendors, and designs every element to bring your wedding vision to life.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Step 3: Perfect Execution</h3>
              <p className="text-muted-foreground leading-relaxed">
                On your wedding day, we coordinate every detail seamlessly so you can focus on celebrating with your loved ones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      {weddingPortfolio && weddingPortfolio.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Wedding Gallery
              </h2>
              <p className="text-xl text-muted-foreground">
                Beautiful moments from love stories we've helped tell
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {weddingPortfolio.map((item) => (
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
                  View All Weddings <ExternalLink className="ml-2 h-5 w-5" />
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
              <span className="block text-primary">Dream Wedding?</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Your love story deserves a perfect celebration. From intimate ceremonies to grand receptions, we'll work with you to create a wedding experience that's uniquely yours and unforgettably beautiful.
            </p>

            <div className="pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 text-lg">
                    Start Planning My Wedding
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogTitle>Start Planning Your Dream Wedding</DialogTitle>
                  <DialogDescription>Fill out this form to begin planning your perfect wedding</DialogDescription>
                  <InquiryForm 
                    formType="inquiry"
                    eventType="wedding"
                    title="Start Planning Your Dream Wedding"
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

export default WeddingEvents;