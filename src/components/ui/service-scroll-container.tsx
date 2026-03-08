import { useState, useRef, useEffect, ReactNode, useCallback, Children } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ServiceScrollContainerProps {
  children: ReactNode;
  items: any[];
  className?: string;
}

export const ServiceScrollContainer = ({ children, items, className }: ServiceScrollContainerProps) => {
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 1 : 3;
  const childArray = Children.toArray(children);
  const totalPages = Math.ceil(childArray.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sliding container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {Array.from({ length: totalPages }).map((_, pageIdx) => {
            const start = pageIdx * itemsPerPage;
            const pageChildren = childArray.slice(start, start + itemsPerPage);
            return (
              <div
                key={pageIdx}
                className={cn(
                  "w-full flex-shrink-0 grid gap-4 md:gap-6 lg:gap-8",
                  isMobile ? "grid-cols-1 px-2" : "grid-cols-3"
                )}
              >
                {pageChildren}
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
            aria-label="Previous items"
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
            aria-label="Next items"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};
