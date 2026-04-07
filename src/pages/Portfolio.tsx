import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useEvents, usePortfolio } from "@/hooks/useData";
import { Camera, ArrowRight } from "lucide-react";
import { useState } from "react";
import FilterButtons from "@/components/portfolio/FilterButtons";
import EventCard from "@/components/portfolio/EventCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Portfolio = () => {
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredPortfolio = portfolio?.filter(item => {
    if (activeFilter === "all") return true;
    const associatedEvent = events?.find(event => event.id === item.event_id);
    return associatedEvent?.event_type === activeFilter && associatedEvent?.is_active === true;
  }) || [];

  const allPortfolioItems = filteredPortfolio;
  
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
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading portfolio...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/4 via-background to-secondary/3">
        <div className="container mx-auto px-5 sm:px-6 text-center max-w-6xl">
          <Badge variant="outline" className="mb-5">
            <Camera className="mr-2 h-3.5 w-3.5" />
            Our Work
          </Badge>
          <h1 className="mb-6 text-foreground">
            Event Portfolio
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our collection of successful events and celebrations. Each project showcases our commitment to excellence and attention to detail.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-10">
        <div className="container mx-auto px-5 sm:px-6">
          <FilterButtons 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="pb-20 lg:pb-28">
        <div className="container mx-auto px-5 sm:px-6">
          {allPortfolioItems.length > 0 ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Event Portfolio
                </h2>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                  Explore our collection of successful events and celebrations
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPortfolioItems.map((portfolioItem) => {
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
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-3 text-foreground">
                {activeFilter === "all" ? "Portfolio Coming Soon" : "No Events Found"}
              </h3>
              <p className="text-base text-muted-foreground max-w-md mx-auto">
                {activeFilter === "all" 
                  ? "We're currently building our portfolio gallery. Check back soon to see our amazing work!"
                  : "No events found for the selected category. Try selecting a different filter."
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/4 via-background to-secondary/3">
        <div className="container mx-auto px-5 sm:px-6 text-center max-w-6xl">
          <h2 className="mb-6 text-foreground">
            Ready to Create Your Own Success Story?
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Let us help you plan and execute an unforgettable event that will be featured in our next portfolio showcase.
          </p>
          <Button asChild size="lg" variant="premium">
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
