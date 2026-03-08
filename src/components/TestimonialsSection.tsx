import { useRef, useEffect, useState, useCallback } from "react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Quote, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const TestimonialsSection = () => {
  const { data: testimonials, isLoading } = useTestimonials();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = testimonials ? Math.ceil(testimonials.length / itemsPerPage) : 0;

  const goNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (totalPages <= 1 || isPaused) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [totalPages, isPaused, goNext]);

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

        {/* Sliding container */}
        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const start = pageIdx * itemsPerPage;
              const pageItems = testimonials.slice(start, start + itemsPerPage);
              return (
                <div
                  key={pageIdx}
                  className={cn(
                    "w-full flex-shrink-0 grid gap-4 md:gap-6",
                    isMobile ? "grid-cols-1 px-2" : "grid-cols-3"
                  )}
                >
                  {pageItems.map((testimonial) => (
                    <Card key={testimonial.id} className="h-full border-border/40 bg-card/80 hover:shadow-strong transition-all duration-400 hover:-translate-y-1">
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
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons below cards */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={goPrev}
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    currentPage === i
                      ? "w-6 h-2.5 bg-primary"
                      : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={goNext}
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
