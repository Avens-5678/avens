import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CarouselDotsProps {
  totalSlides: number;
  currentSlide: number;
  onSlideChange: (index: number) => void;
  className?: string;
}

export const CarouselDots = ({ 
  totalSlides, 
  currentSlide, 
  onSlideChange, 
  className 
}: CarouselDotsProps) => {
  return (
    <div className={cn(
      "flex items-center justify-center space-x-2 mt-6", 
      className
    )}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSlideChange(index)}
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-300 border-0",
            currentSlide === index
              ? "bg-black scale-125"
              : "bg-gray-300 hover:bg-gray-400"
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

interface EnhancedCarouselProps {
  children: React.ReactNode;
  className?: string;
  autoPlay?: boolean;
  delay?: number;
  showDots?: boolean;
  onSlideChange?: (index: number) => void;
}

export const EnhancedCarousel = ({
  children,
  className,
  autoPlay = true,
  delay = 5000,
  showDots = true,
  onSlideChange
}: EnhancedCarouselProps) => {
  const slides = Array.isArray(children) ? children : [children];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        onSlideChange?.(next);
        return next;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length, delay, onSlideChange]);

  // Pause autoplay on hover to prevent flickering during interaction
  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(autoPlay);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    onSlideChange?.(index);
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  };

  const prevSlide = () => {
    const prev = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    goToSlide(prev);
  };

  // Touch handlers for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsPlaying(false); // Pause autoplay during touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    // Resume autoplay after touch ends
    setTimeout(() => setIsPlaying(autoPlay), 100);
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex transition-transform duration-700 ease-in-out will-change-transform"
        style={{ 
          transform: `translateX(-${currentSlide * 100}%)`,
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0 transform-gpu">
            {slide}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md transition-all duration-300 hidden md:flex"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            ←
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md transition-all duration-300 hidden md:flex"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            →
          </Button>
        </>
      )}

      {/* Dots navigation */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <CarouselDots
            totalSlides={slides.length}
            currentSlide={currentSlide}
            onSlideChange={goToSlide}
          />
        </div>
      )}
    </div>
  );
};