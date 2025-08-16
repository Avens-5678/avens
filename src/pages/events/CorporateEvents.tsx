import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useEvent, usePortfolio } from "@/hooks/useData";
import { Briefcase, ArrowRight, Users, Target, Trophy, ExternalLink, Camera } from "lucide-react";
import corporateHero from "@/assets/corporate-events-hero.jpg";

const CorporateEvents = () => {
  const { data: event, isLoading } = useEvent("corporate");
  const { data: portfolio } = usePortfolio();

  const corporatePortfolio = portfolio?.filter(item => 
    item.tag?.toLowerCase().includes('corporate') || 
    item.tag?.toLowerCase().includes('business')
  )?.slice(0, 6);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading corporate services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const features = [
    {
      icon: Users,
      title: "Team Building",
      description: "Strengthen team bonds with engaging activities"
    },
    {
      icon: Target,
      title: "Strategic Events",
      description: "Goal-oriented events that drive business success"
    },
    {
      icon: Trophy,
      title: "Award Ceremonies",
      description: "Celebrate achievements with memorable events"
    }
  ];

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${event?.hero_image_url || corporateHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Briefcase className="mr-2 h-4 w-4" />
              Corporate Events
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {event?.title || "Elevate Your Business Events"}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-xl">
              {event?.description || "Professional event planning that strengthens your brand and drives business success"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/portfolio">
                  View Our Work <Camera className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our Corporate Event Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We understand the unique needs of business events and deliver results that matter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      {corporatePortfolio && corporatePortfolio.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Recent Corporate Events
              </h2>
              <p className="text-xl text-muted-foreground">
                See how we've helped businesses create memorable experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {corporatePortfolio.map((item) => (
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
                  View All Work <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Elevate Your Corporate Events?
              </h2>
              <p className="text-xl text-muted-foreground">
                Let's discuss your business objectives and create impactful experiences
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <InquiryForm 
                  formType="inquiry"
                  eventType="corporate"
                  title="Corporate Event Inquiry"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CorporateEvents;