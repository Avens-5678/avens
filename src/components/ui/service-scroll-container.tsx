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
  const autoPlayRef = useRef<ReturnType<typeof setInterval>>();

  const goNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (totalPages <= 1 || isPaused) return;
    autoPlayRef.current = setInterval(goNext, 5000);
    return () => clearInterval(autoPlayRef.current);
  }, [totalPages, isPaused, goNext]);

  const startIdx = currentPage * itemsPerPage;
  const visibleChildren = childArray.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
          className
        )}
      >
        {visibleChildren}
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
          <span className="text-sm text-muted-foreground">
            {currentPage + 1} / {totalPages}
          </span>
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
