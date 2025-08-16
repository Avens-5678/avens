import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout/Layout";
import { useEvents, usePortfolio } from "@/hooks/useData";
import { ArrowRight, Camera, Calendar, MapPin, Filter } from "lucide-react";
import { useState } from "react";

const Portfolio = () => {
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio();
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Calculate derived values before early returns
  const uniqueTags = Array.from(new Set(portfolio?.map(item => item.tag).filter(Boolean))) as string[];
  
  // Filter portfolio by selected tag
  const getFilteredPortfolio = (eventId: string) => {
    const eventPortfolio = portfolio?.filter(item => item.event_id === eventId) || [];
    if (selectedTag === "all") return eventPortfolio;
    return eventPortfolio.filter(item => item.tag === selectedTag);
  };

  // Filter events that have portfolio items to create event cards
  const eventsWithPortfolio = events?.filter(event => 
    portfolio?.some(item => item.event_id === event.id)
  ) || [];

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Event Portfolio
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our collection of successful events and celebrations. Each project showcases our commitment to excellence and attention to detail.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Event Cards Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {eventsWithPortfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventsWithPortfolio.map((event) => {
                const filteredPortfolio = getFilteredPortfolio(event.id);
                if (selectedTag !== "all" && filteredPortfolio.length === 0) return null;
                
                return (
                <Card key={event.id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/50">
                  {/* Hero Image */}
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      src={event.hero_image_url || '/placeholder.svg'} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Category Badge Overlay */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-background/90 text-foreground hover:bg-background/80 backdrop-blur-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Event Information */}
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </CardTitle>
                      
                      {/* Location */}
                      {event.location && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {event.description}
                    </p>
                    
                    {/* View Gallery Button */}
                    <div className="pt-2">
                      <Button 
                        asChild 
                        className="w-full group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent transition-all duration-300"
                      >
                        <Link to={`/portfolio/${event.id}`}>
                          View Gallery <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
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