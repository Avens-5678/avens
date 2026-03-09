import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export const ProductImageCarousel = ({
  images,
  title,
  className,
  autoPlay = false,
  interval = 3000,
}: ProductImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, images.length, interval]);

  const goToPrevious = () =>
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  const goToNext = () =>
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  const goToSlide = (index: number) => setCurrentIndex(index);

  if (!images || images.length === 0) {
    return (
      <div className={cn("relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10", className)}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-muted-foreground">No Image Available</div>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={cn("relative h-48 overflow-hidden", className)}>
        <img
          src={images[0]}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative h-48 overflow-hidden group", className)}>
      <div className="relative w-full h-full">
        <img
          src={images[currentIndex]}
          alt={`${title} ${currentIndex + 1}`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Next image"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentIndex === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        {/* Image Counter */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};
