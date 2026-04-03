import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface MultiImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
}

export const MultiImageCarousel = ({ images, title, className = "" }: MultiImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-[4/3] bg-muted flex items-center justify-center rounded-lg ${className}`}>
        <svg viewBox="0 0 80 80" fill="none" className="w-12 h-12 text-muted-foreground/40">
          <rect x="10" y="20" width="60" height="45" rx="4" stroke="currentColor" strokeWidth="2" />
          <path d="M10 52l15-12 10 8 20-16 15 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="30" cy="35" r="5" stroke="currentColor" strokeWidth="2" />
          <path d="M25 10h30M40 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  if (images.length === 1) {
    return (
      <div className={`aspect-[4/3] overflow-hidden rounded-lg ${className}`}>
        <OptimizedImage 
          src={images[0]} 
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-lg group ${className}`}>
      <OptimizedImage 
        src={images[currentIndex]} 
        alt={`${title} - Image ${currentIndex + 1}`}
        loading="lazy"
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      
      {/* Navigation buttons */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 bg-white/80 hover:bg-white/90"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 bg-white/80 hover:bg-white/90"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Image indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
      
      {/* Image counter */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};