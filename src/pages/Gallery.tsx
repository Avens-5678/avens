import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useEvents, usePortfolio } from "@/hooks/useData";
import { ArrowLeft, Camera, ExternalLink } from "lucide-react";

const Gallery = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: portfolio, isLoading } = usePortfolio(eventId);
  const { data: events } = useEvents();
  
  // Find the event associated with this portfolio
  const event = events?.find(e => e.id === eventId);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const regularImages = portfolio?.filter(item => !item.is_before_after) || [];
  const beforeAfterImages = portfolio?.filter(item => item.is_before_after) || [];

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Camera className="mr-2 h-4 w-4" />
              Gallery
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {event?.title || "Event Gallery"}
            </h1>
            <Button asChild variant="outline" className="mb-8">
              <Link to="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {regularImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularImages.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tag && (
                        <Badge variant="outline" className="text-xs">
                          {item.tag}
                        </Badge>
                      )}
                      {item.album_url && (
                        <Badge variant="secondary" className="text-xs">
                          <Camera className="mr-1 h-3 w-3" />
                          Album
                        </Badge>
                      )}
                    </div>
                    {item.album_url && (
                      <div className="mt-2">
                        <a 
                          href={item.album_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View Full Album
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Gallery Images</h3>
              <p className="text-muted-foreground">
                Portfolio items for this event will appear here once they're added.
              </p>
            </div>
          )}

          {beforeAfterImages.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-center mb-12">Before & After</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {beforeAfterImages.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge variant={item.is_before ? "secondary" : "default"}>
                          {item.is_before ? "Before" : "After"}
                        </Badge>
                      </div>
                      {item.album_url && (
                        <div className="mt-2">
                          <a 
                            href={item.album_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Full Album
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;