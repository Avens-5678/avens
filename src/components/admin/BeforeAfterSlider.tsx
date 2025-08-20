import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

const BeforeAfterSlider = ({ beforeImage, afterImage, className }: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <Card 
      className={cn("relative overflow-hidden cursor-grab select-none", className)}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* After Image (Background) */}
      <div className="relative w-full h-64 md:h-80">
        <img
          src={afterImage}
          alt="After"
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Before Image (Overlay) */}
        <div 
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt="Before"
            className="w-full h-full object-cover"
            draggable={false}
            style={{ width: `${(containerRef.current?.offsetWidth || 0)}px` }}
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 h-full w-1 bg-white shadow-lg cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={() => setIsDragging(true)}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-primary flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-2 py-1 bg-black/70 text-white text-sm rounded">
          Before
        </div>
        <div className="absolute top-4 right-4 px-2 py-1 bg-black/70 text-white text-sm rounded">
          After
        </div>
      </div>
    </Card>
  );
};

export default BeforeAfterSlider;