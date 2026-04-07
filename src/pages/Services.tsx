import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useAllServices, useAllRentals, useAwards } from "@/hooks/useData";
import { ArrowRight, Sparkles, Award, Package, CheckCircle, Star, Users, Clock } from "lucide-react";

const Services = () => {
  const { data: services, isLoading: loadingServices } = useAllServices();
  const { data: rentals, isLoading: loadingRentals } = useAllRentals();
  const { data: awards, isLoading: loadingAwards } = useAwards();

  if (loadingServices || loadingRentals || loadingAwards) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/4 via-background to-secondary/3">
        <div className="container mx-auto px-5 sm:px-6 max-w-6xl text-center">
          <Badge variant="outline" className="mb-5">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Our Services
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Exceptional Event Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From intimate gatherings to grand celebrations, we provide comprehensive event management and premium rental services tailored to your unique vision.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Event Management Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional event planning and execution for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service) => (
              <Card key={service.id} className="group hover:shadow-strong transition-all duration-400 hover:-translate-y-1 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {service.short_description}
                  </p>
                  <Button asChild variant="premium" className="w-full">
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
      <section className="py-16 lg:py-24 bg-muted/40">
        <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-5">
              <Package className="mr-2 h-3.5 w-3.5" />
              Equipment Rental
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Premium Event Rentals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              High-quality equipment, furniture, and decor to complement your event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {rentals?.slice(0, 6).map((rental) => (
              <Card key={rental.id} className="hover:shadow-strong transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{rental.title}</CardTitle>
                  {rental.price_range && (
                    <p className="text-sm text-primary font-semibold">{rental.price_range}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{rental.short_description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="premium" size="lg">
              <Link to="/ecommerce">
                View More Rentals <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-5">
              <Star className="mr-2 h-3.5 w-3.5" />
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              What Sets Us Apart
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the difference with our professional approach and attention to detail
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Star, title: "Premium Quality", desc: "Only the finest materials and equipment for your special day", color: "text-primary" },
              { icon: Users, title: "Expert Team", desc: "Experienced professionals dedicated to your event's success", color: "text-secondary" },
              { icon: Clock, title: "On-Time Delivery", desc: "Punctual setup and seamless execution every time", color: "text-primary" },
              { icon: CheckCircle, title: "Full Service", desc: "Complete event management from planning to cleanup", color: "text-secondary" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <Card key={title} className="text-center border-border/40 hover:shadow-strong hover:-translate-y-1 transition-all duration-400">
                <CardHeader>
                  <div className="mx-auto w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-3">
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      {awards && awards.length > 0 && (
        <section className="py-16 lg:py-24 bg-muted/40">
          <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-5">
                <Award className="mr-2 h-3.5 w-3.5" />
                Recognition
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Awards & Achievements
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Recognized for excellence in event management and customer service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {awards.map((award) => (
                <Card key={award.id} className="text-center hover:shadow-strong transition-all duration-300 hover:-translate-y-1">
                  {award.logo_url && (
                    <div className="p-6 pb-0">
                      <img src={award.logo_url} alt={award.title} className="h-14 w-14 mx-auto object-contain" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{award.title}</CardTitle>
                    {award.year && <p className="text-sm text-primary font-semibold">{award.year}</p>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{award.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/4 via-background to-secondary/3">
        <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Ready to Plan Your Event?
              </h2>
              <p className="text-lg text-muted-foreground">
                Get in touch with our team to discuss your requirements
              </p>
            </div>
            <div className="flex justify-center bg-transparent">
              <InquiryForm formType="contact" title="Contact Our Team" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
