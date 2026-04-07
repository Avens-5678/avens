import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import InquiryForm from "@/components/forms/InquiryForm";
import { useEvent, usePortfolio } from "@/hooks/useData";
import { ArrowRight, Calendar, Camera, MapPin, Clock, Users } from "lucide-react";

const EventDetail = () => {
  const { eventType } = useParams<{ eventType: string }>();
  const { data: event, isLoading: loadingEvent } = useEvent(eventType || "");
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio(event?.id);

  if (loadingEvent || loadingPortfolio) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading event details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
            <p className="text-xl text-muted-foreground mb-8">
              The event type you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/services">Back to Services</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const galleryImages = portfolio?.filter(item => !item.is_before_after) || [];
  const beforeAfterImages = portfolio?.filter(item => item.is_before_after) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Calendar className="mr-2 h-4 w-4" />
              {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} Events
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {event.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      {event.hero_image_url && (
        <section className="py-0">
          <div className="container mx-auto px-4">
            <div className="aspect-video overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={event.hero_image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Clock className="mr-2 h-4 w-4" />
                Our Process
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How We Manage Your Event
              </h2>
              <p className="text-xl text-muted-foreground">
                Our systematic approach ensures every detail is perfect
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="bg-muted/50 p-8 rounded-2xl">
                <div className="text-lg text-muted-foreground leading-relaxed space-y-6">
                  {event.process_description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {galleryImages.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Camera className="mr-2 h-4 w-4" />
                Gallery Preview
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Recent {event.title} Events
              </h2>
              <p className="text-xl text-muted-foreground">
                See some of our beautiful work in action
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {galleryImages.slice(0, 6).map((item) => (
                <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0">
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
          </div>
        </section>
      )}

      {/* Before & After */}
      {beforeAfterImages.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                Transformation
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Before & After
              </h2>
              <p className="text-xl text-muted-foreground">
                See the incredible transformations we create
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {beforeAfterImages.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {item.title}
                    </CardTitle>
                    <Badge variant={item.is_before ? "secondary" : "default"} className="w-fit">
                      {item.is_before ? "Before" : "After"}
                    </Badge>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Inquiry Form */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Plan Your {event.title}?
              </h2>
              <p className="text-xl text-muted-foreground">
                Let's discuss your vision and make it a reality
              </p>
            </div>

            <div className="flex justify-center">
              <InquiryForm 
                formType="inquiry"
                eventType={event.event_type}
                title={`Plan Your ${event.title}`}
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventDetail;