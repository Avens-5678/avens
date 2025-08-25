import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        {cards.map((card, index) => {
          const offset = index - currentIndex;
          const isVisible = Math.abs(offset) <= 2;
          
          if (!isVisible) return null;

          return (
            <motion.div
              key={index}
              className="absolute inset-0 cursor-pointer"
              initial={{ 
                rotateY: offset * 25, 
                z: -Math.abs(offset) * 100,
                opacity: offset === 0 ? 1 : 0.7,
              }}
              animate={{ 
                rotateY: offset * 25, 
                z: -Math.abs(offset) * 100,
                opacity: offset === 0 ? 1 : 0.7,
                scale: offset === 0 ? 1 : 0.9 - Math.abs(offset) * 0.1,
              }}
              exit={{ 
                rotateY: offset * 25, 
                z: -Math.abs(offset) * 100,
                opacity: 0,
              }}
              transition={{ 
                duration: 0.6, 
                ease: [0.25, 0.46, 0.45, 0.94] 
              }}
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
              }}
              onClick={offset !== 0 ? (offset > 0 ? nextCard : prevCard) : undefined}
            >
              {card}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {cards.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              currentIndex === index 
                ? 'bg-primary scale-125' 
                : 'bg-primary/30 hover:bg-primary/50'
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}