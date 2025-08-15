import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useEvents, usePortfolio } from "@/hooks/useData";
import { ArrowRight, Camera, Calendar } from "lucide-react";

const Portfolio = () => {
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio();

  if (loadingEvents || loadingPortfolio) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading portfolio...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Group portfolio items by event
  const eventPortfolios = events?.map(event => ({
    event,
    portfolioItems: portfolio?.filter(item => item.event_id === event.id) || []
  })) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Camera className="mr-2 h-4 w-4" />
            Our Work
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Event Portfolio
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our collection of successful events and celebrations. Each project showcases our commitment to excellence and attention to detail.
          </p>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {eventPortfolios.length > 0 ? (
            <div className="space-y-20">
              {eventPortfolios.map(({ event, portfolioItems }) => (
                <div key={event.id} className="space-y-8">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-4">
                      <Calendar className="mr-2 h-4 w-4" />
                      {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} Events
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      {event.title}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      {event.description.substring(0, 200)}...
                    </p>
                  </div>

                  {portfolioItems.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolioItems.slice(0, 6).map((item) => (
                          <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="aspect-video overflow-hidden">
                              <img 
                                src={item.image_url} 
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <CardHeader>
                              <CardTitle className="text-lg font-semibold line-clamp-2">
                                {item.title}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>

                      <div className="text-center">
                        <Button asChild variant="outline" size="lg">
                          <Link to={`/portfolio/${event.id}`}>
                            View Full Gallery <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Gallery coming soon for {event.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Portfolio Coming Soon</h3>
              <p className="text-xl text-muted-foreground max-w-md mx-auto">
                We're currently building our portfolio gallery. Check back soon to see our amazing work!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Your Own Success Story?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let us help you plan and execute an unforgettable event that will be featured in our next portfolio showcase.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent">
            <Link to="/services">
              Start Planning <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;