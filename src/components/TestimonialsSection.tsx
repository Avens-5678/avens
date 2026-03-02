import { useTestimonials } from "@/hooks/useTestimonials";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, Users } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const TestimonialsSection = () => {
  const { data: testimonials, isLoading } = useTestimonials();

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="text-center">
            <div className="h-8 w-32 mx-auto mb-4 bg-muted animate-pulse rounded" />
            <div className="h-12 w-80 mx-auto mb-8 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating 
              ? "text-secondary fill-secondary" 
              : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="text-center mb-12 lg:mb-16">
          <Badge variant="outline" className="mb-5">
            <Users className="mr-2 h-3.5 w-3.5" />
            Client Stories
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-foreground">
            What Our Clients Say
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real experiences from clients who trusted us with their important moments
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-3 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full border-border/40 bg-card/80 hover:shadow-strong transition-all duration-400 hover:-translate-y-1">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="mb-5">
                        <Quote className="h-5 w-5 text-primary/40 mb-3" />
                        <p className="text-sm leading-relaxed text-foreground/85 line-clamp-4">
                          "{testimonial.testimonial}"
                        </p>
                      </div>
                      
                      <div className="mt-auto pt-5 border-t border-border/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={testimonial.image_url} alt={testimonial.client_name} />
                            <AvatarFallback className="bg-primary/8 text-primary font-semibold text-xs">
                              {testimonial.client_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{testimonial.client_name}</h4>
                            {(testimonial.position || testimonial.company) && (
                              <p className="text-xs text-muted-foreground truncate">
                                {[testimonial.position, testimonial.company].filter(Boolean).join(' at ')}
                              </p>
                            )}
                          </div>
                        </div>
                        {renderStars(testimonial.rating)}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-3 mt-10">
              <CarouselPrevious className="h-11 w-11 rounded-xl border-border/40 hover:bg-muted hover:border-border static translate-x-0 translate-y-0 transition-all" />
              <CarouselNext className="h-11 w-11 rounded-xl border-border/40 hover:bg-muted hover:border-border static translate-x-0 translate-y-0 transition-all" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
