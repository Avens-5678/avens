import { useTestimonials } from "@/hooks/useTestimonials";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, Users } from "lucide-react";
import { AnimatedText, GradientText } from "@/components/ui/animated-text";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TestimonialsSection = () => {
  const { data: testimonials, isLoading } = useTestimonials();

  if (isLoading) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="shimmer-loading h-8 w-32 mx-auto mb-4"></div>
            <div className="shimmer-loading h-12 w-80 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer-loading h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-32 bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-primary/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <AnimatedText variant="fade-in-up">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Users className="mr-2 h-4 w-4" />
              Client Stories
            </Badge>
          </AnimatedText>
          
          <AnimatedText variant="fade-in-up" delay={200}>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              What Our <GradientText>Clients</GradientText><br />
              <GradientText variant="secondary">Say About Us</GradientText>
            </h2>
          </AnimatedText>
          
          <AnimatedText variant="fade-in-up" delay={400}>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Real experiences from real clients who trusted us with their most important moments
            </p>
          </AnimatedText>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <AnimatedText 
                    variant="fade-in-up" 
                    delay={index * 100}
                    className="h-full"
                  >
                    <Card className="glassmorphism-card hover:shadow-glow transition-all duration-500 h-full">
                      <CardContent className="p-8 h-full flex flex-col">
                        <div className="mb-6">
                          <Quote className="h-8 w-8 text-primary/60 mb-4" />
                          <p className="text-lg leading-relaxed text-foreground mb-6 italic">
                            "{testimonial.testimonial}"
                          </p>
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={testimonial.image_url} alt={testimonial.client_name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {testimonial.client_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{testimonial.client_name}</h4>
                              {testimonial.position && testimonial.company && (
                                <p className="text-sm text-muted-foreground">
                                  {testimonial.position} at {testimonial.company}
                                </p>
                              )}
                              {testimonial.position && !testimonial.company && (
                                <p className="text-sm text-muted-foreground">
                                  {testimonial.position}
                                </p>
                              )}
                              {!testimonial.position && testimonial.company && (
                                <p className="text-sm text-muted-foreground">
                                  {testimonial.company}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {renderStars(testimonial.rating)}
                            <div className="floating-badge">
                              <span className="text-xs font-medium">
                                {testimonial.rating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedText>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="glassmorphism-btn border-primary/20 hover:border-primary/40" />
              <CarouselNext className="glassmorphism-btn border-primary/20 hover:border-primary/40" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;