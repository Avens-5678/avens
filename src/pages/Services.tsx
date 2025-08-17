import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useAllServices, useAllRentals, useAwards } from "@/hooks/useData";
import { ArrowRight, Sparkles, Award, Package } from "lucide-react";

const Services = () => {
  const { data: services, isLoading: loadingServices } = useAllServices();
  const { data: rentals, isLoading: loadingRentals } = useAllRentals();
  const { data: awards, isLoading: loadingAwards } = useAwards();

  if (loadingServices || loadingRentals || loadingAwards) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading services...</p>
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
            <Sparkles className="mr-2 h-4 w-4" />
            Our Services
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Exceptional Event Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From intimate gatherings to grand celebrations, we provide comprehensive event management and premium rental services tailored to your unique vision.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Event Management Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional event planning and execution for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map((service) => (
              <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl font-semibold group-hover:text-hover transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground mb-6">
                    {service.short_description}
                  </p>
                  <Button 
                    asChild
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
                  >
                    <Link to={`/events/${service.event_type.replace('_', '-')}`}>
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rental Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Package className="mr-2 h-4 w-4" />
              Equipment Rental
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Premium Event Rentals
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              High-quality equipment, furniture, and decor to complement your event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {rentals?.slice(0, 6).map((rental) => (
              <Card key={rental.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {rental.title}
                  </CardTitle>
                  {rental.price_range && (
                    <p className="text-sm text-primary font-semibold">
                      {rental.price_range}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {rental.short_description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent">
              <Link to="/ecommerce">
                View More Rentals <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      {awards && awards.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Award className="mr-2 h-4 w-4" />
                Recognition
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Awards & Achievements
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Recognized for excellence in event management and customer service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {awards.map((award) => (
                <Card key={award.id} className="text-center hover:shadow-lg transition-all duration-300">
                  {award.logo_url && (
                    <div className="p-6">
                      <img 
                        src={award.logo_url} 
                        alt={award.title}
                        className="h-16 w-16 mx-auto object-contain"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {award.title}
                    </CardTitle>
                    {award.year && (
                      <p className="text-sm text-primary font-semibold">
                        {award.year}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {award.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Plan Your Event?
              </h2>
              <p className="text-xl text-muted-foreground">
                Get in touch with our team to discuss your requirements
              </p>
            </div>

            <div className="flex justify-center">
              <InquiryForm 
                formType="contact"
                title="Contact Our Team"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;