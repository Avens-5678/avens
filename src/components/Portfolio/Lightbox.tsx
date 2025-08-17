import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LightboxProps {
  images: Array<{ id: string; image_url: string; title: string; }>;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const Lightbox = ({ images, currentIndex, isOpen, onClose }: LightboxProps) => {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          setIndex((prev) => (prev - 1 + images.length) % images.length);
          break;
        case "ArrowRight":
          setIndex((prev) => (prev + 1) % images.length);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[index];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background text-foreground"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Previous button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {/* Next button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Main image */}
        <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
          <img
            src={currentImage.image_url}
            alt={currentImage.title}
            className="max-w-full max-h-full object-contain shadow-2xl"
          />
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 text-foreground px-4 py-2 rounded-full text-sm font-medium">
            {index + 1} / {images.length}
          </div>
        )}

        {/* Click overlay to close */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default Lightbox;