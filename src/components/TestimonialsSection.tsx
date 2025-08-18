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
    <section className="py-16 lg:py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 lg:mb-12">
          <AnimatedText variant="fade-in-up">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Users className="mr-2 h-4 w-4" />
              Client Stories
            </Badge>
          </AnimatedText>
          
          <AnimatedText variant="fade-in-up" delay={200}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              What Our <GradientText>Clients</GradientText> Say
            </h2>
          </AnimatedText>
          
          <AnimatedText variant="fade-in-up" delay={400}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real experiences from clients who trusted us with their important moments
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
            <CarouselContent className="-ml-1 md:-ml-2 lg:-ml-3">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="pl-1 md:pl-2 lg:pl-3 basis-full md:basis-1/2 lg:basis-1/3">
                  <AnimatedText 
                    variant="fade-in-up" 
                    delay={index * 100}
                    className="h-full"
                  >
                    <Card 
                      className="glassmorphism-card hover:shadow-glow transition-all duration-500 h-full group hover:-translate-y-1 border border-white/10 hover:border-primary/50 relative cursor-pointer overflow-hidden"
                      onMouseMove={(e) => {
                        const card = e.currentTarget;
                        const { left, top, width, height } = card.getBoundingClientRect();
                        const x = e.clientX - left;
                        const y = e.clientY - top;
                        card.style.setProperty('--mouse-x', `${x}px`);
                        card.style.setProperty('--mouse-y', `${y}px`);
                      }}
                    >
                      {/* Spotlight Effect */}
                      <div
                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `radial-gradient(300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.1), transparent 70%)`,
                        }}
                      />
                      <CardContent className="p-6 h-full flex flex-col">
                        <div className="mb-4">
                          <Quote className="h-6 w-6 text-primary/60 mb-3" />
                          <p className="text-base leading-relaxed text-foreground mb-4 italic line-clamp-3">
                            "{testimonial.testimonial}"
                          </p>
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={testimonial.image_url} alt={testimonial.client_name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                {testimonial.client_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-base">{testimonial.client_name}</h4>
                              {testimonial.position && testimonial.company && (
                                <p className="text-xs text-muted-foreground">
                                  {testimonial.position} at {testimonial.company}
                                </p>
                              )}
                              {testimonial.position && !testimonial.company && (
                                <p className="text-xs text-muted-foreground">
                                  {testimonial.position}
                                </p>
                              )}
                              {!testimonial.position && testimonial.company && (
                                <p className="text-xs text-muted-foreground">
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
              <CarouselPrevious className="glassmorphism-btn border-primary/20 hover:border-primary/40 h-12 w-12 hover:scale-110 transition-all duration-500 hover:shadow-glow animate-pulse-glow static translate-x-0 translate-y-0" />
              <CarouselNext className="glassmorphism-btn border-primary/20 hover:border-primary/40 h-12 w-12 hover:scale-110 transition-all duration-500 hover:shadow-glow animate-pulse-glow static translate-x-0 translate-y-0" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;