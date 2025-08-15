import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useEvent, usePortfolio } from "@/hooks/useData";
import { ArrowLeft, Camera } from "lucide-react";

const Gallery = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: portfolio, isLoading } = usePortfolio(eventId);
  const { data: event } = useEvent(portfolio?.[0]?.events?.event_type || "");

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularImages.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-300"
                />
              </Card>
            ))}
          </div>

          {beforeAfterImages.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-center mb-12">Before & After</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {beforeAfterImages.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="p-4">
                      <Badge variant={item.is_before ? "secondary" : "default"}>
                        {item.is_before ? "Before" : "After"}
                      </Badge>
                    </div>
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