import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useEvents, usePortfolio } from "@/hooks/useData";
import { Camera, ArrowRight, Eye } from "lucide-react";
import { useState } from "react";
import FilterButtons from "@/components/Portfolio/FilterButtons";
import EventCard from "@/components/Portfolio/EventCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BeforeAfterSlider from "@/components/ui/before-after-slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Portfolio = () => {
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Filter portfolio items by selected filter
  const filteredPortfolio = portfolio?.filter(item => {
    if (activeFilter === "all") return true;
    // Find the associated event and check its type
    const associatedEvent = events?.find(event => event.id === item.event_id);
    return associatedEvent?.event_type === activeFilter && associatedEvent?.is_active === true;
  }) || [];

  // Separate before/after items from regular portfolio items
  const beforeAfterItems = filteredPortfolio.filter(item => 
    item.is_before_after && 
    (item as any).before_image_url && 
    (item as any).after_image_url
  );
  
  // Items marked as before/after but missing images should show in regular section
  const incompleteBeforeAfterItems = filteredPortfolio.filter(item => 
    item.is_before_after && 
    (!(item as any).before_image_url || !(item as any).after_image_url)
  );
  
  const regularPortfolioItems = [
    ...filteredPortfolio.filter(item => !item.is_before_after),
    ...incompleteBeforeAfterItems
  ];
  
  console.log('Portfolio debug:', { 
    portfolio: portfolio?.length, 
    events: events?.length, 
    activeFilter, 
    filteredPortfolio: filteredPortfolio.length,
    allEvents: events?.map(e => ({ id: e.id, type: e.event_type, active: e.is_active })),
    allPortfolio: portfolio?.map(p => ({ id: p.id, event_id: p.event_id, title: p.title }))
  });

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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Camera className="mr-2 h-4 w-4" />
            Our Work
          </Badge>
          <h1 className="mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Event Portfolio
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our collection of successful events and celebrations. Each project showcases our commitment to excellence and attention to detail.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <FilterButtons 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
        </div>
      </section>

      {/* Before & After Transformations */}
      {beforeAfterItems.length > 0 && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Eye className="mr-2 h-4 w-4" />
                Transformations
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Before & After Showcase
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See the incredible transformations we create for our clients
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {beforeAfterItems.map((item) => {
                const associatedEvent = events?.find(event => event.id === item.event_id);
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      {associatedEvent && (
                        <Badge variant="outline" className="w-fit">
                          {associatedEvent.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="p-0">
                      <BeforeAfterSlider
                        beforeImage={(item as any).before_image_url}
                        afterImage={(item as any).after_image_url}
                        beforeLabel="Before"
                        afterLabel="After"
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Event Cards Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {regularPortfolioItems.length > 0 ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Event Portfolio
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Explore our collection of successful events and celebrations
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPortfolioItems.map((portfolioItem) => {
                  const associatedEvent = events?.find(event => event.id === portfolioItem.event_id);
                  return (
                    <EventCard
                      key={portfolioItem.id}
                      id={portfolioItem.id}
                      title={portfolioItem.title}
                      eventType={associatedEvent?.event_type || 'custom'}
                      location={associatedEvent?.location}
                      heroImage={portfolioItem.image_url}
                      description={associatedEvent?.description || ''}
                    />
                  );
                })}
              </div>
            </>
          ) : beforeAfterItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mb-4">
                {activeFilter === "all" ? "Portfolio Coming Soon" : "No Events Found"}
              </h3>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-md mx-auto">
                {activeFilter === "all" 
                  ? "We're currently building our portfolio gallery. Check back soon to see our amazing work!"
                  : "No events found for the selected category. Try selecting a different filter."
                }
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6">
            Ready to Create Your Own Success Story?
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
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