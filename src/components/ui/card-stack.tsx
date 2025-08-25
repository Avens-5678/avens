import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardStackProps {
  cards: React.ReactNode[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  onCardChange?: (index: number) => void;
}

export function CardStack({ 
  cards, 
  className, 
  autoPlay = true, 
  interval = 3000,
  onCardChange 
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, interval);

    return () => clearInterval(timer);
  }, [cards.length, interval, autoPlay]);

  useEffect(() => {
    onCardChange?.(currentIndex);
  }, [currentIndex, onCardChange]);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className={cn('relative h-96 w-full', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {cards[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Arrow Navigation */}
      {cards.length > 1 && (
        <>
          <button
            onClick={prevCard}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-300 group"
          >
            <ChevronLeft className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
          </button>
          <button
            onClick={nextCard}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-300 group"
          >
            <ChevronRight className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
          </button>
        </>
      )}

      {/* Navigation dots */}
      {cards.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {cards.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                currentIndex === index 
                  ? 'bg-primary scale-125' 
                  : 'bg-primary/30 hover:bg-primary/50'
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}