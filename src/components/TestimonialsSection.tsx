import { useRef, useCallback, useEffect, useState } from "react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Quote, Users, ChevronLeft, ChevronRight } from "lucide-react";

const TestimonialsSection = () => {
  const { data: testimonials, isLoading } = useTestimonials();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>();

  // Auto-scroll animation
  useEffect(() => {
    if (!scrollRef.current || !testimonials?.length) return;

    let scrollPos = 0;
    const speed = 0.5; // px per frame

    const animate = () => {
      if (!scrollRef.current || isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      scrollPos += speed;
      const maxScroll = scrollRef.current.scrollWidth / 2;
      if (scrollPos >= maxScroll) scrollPos = 0;
      scrollRef.current.scrollLeft = scrollPos;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [testimonials, isPaused]);

  // Wheel → horizontal scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY;
  }, []);

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

  if (!testimonials || testimonials.length === 0) return null;

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? "text-secondary fill-secondary" : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );

  // Triple the items for seamless infinite loop
  const tripled = [...testimonials, ...testimonials, ...testimonials];

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

        {/* Navigation buttons */}
        <div className="flex justify-center gap-3 mb-8">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => {
              if (!scrollRef.current) return;
              scrollRef.current.scrollLeft -= 340;
            }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => {
              if (!scrollRef.current) return;
              scrollRef.current.scrollLeft += 340;
            }}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Horizontal scroll container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            onWheel={handleWheel}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-4 overflow-x-hidden py-2 cursor-grab active:cursor-grabbing scroll-smooth"
            style={{ scrollBehavior: "smooth" }}
          >
            {tripled.map((testimonial, idx) => (
              <div key={`${testimonial.id}-${idx}`} className="flex-shrink-0 w-[320px] md:w-[360px]">
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
                            {testimonial.client_name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{testimonial.client_name}</h4>
                          {(testimonial.position || testimonial.company) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {[testimonial.position, testimonial.company].filter(Boolean).join(" at ")}
                            </p>
                          )}
                        </div>
                      </div>
                      {renderStars(testimonial.rating)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
