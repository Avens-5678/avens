import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StaggerMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode[];
  direction?: 'up' | 'down' | 'left' | 'right';
  staggerDelay?: number;
  className?: string;
}

export function StaggerMenu({ 
  trigger, 
  children, 
  direction = 'down', 
  staggerDelay = 0.1,
  className 
}: StaggerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDirectionProps = () => {
    switch (direction) {
      case 'up':
        return { y: 20, originY: 1 };
      case 'down':
        return { y: -20, originY: 0 };
      case 'left':
        return { x: 20, originX: 1 };
      case 'right':
        return { x: -20, originX: 0 };
      default:
        return { y: -20, originY: 0 };
    }
  };

  const directionProps = getDirectionProps();

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    closed: {
      transition: {
        staggerChildren: staggerDelay,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: directionProps.y ? 0 : undefined,
      x: directionProps.x ? 0 : undefined,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
    closed: {
      opacity: 0,
      y: directionProps.y || 0,
      x: directionProps.x || 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <div className={cn('relative', className)}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              'absolute z-50',
              direction === 'up' ? 'bottom-full mb-2' : '',
              direction === 'down' ? 'top-full mt-2' : '',
              direction === 'left' ? 'right-full mr-2' : '',
              direction === 'right' ? 'left-full ml-2' : ''
            )}
            style={{
              transformOrigin: `${directionProps.originX ?? 0.5} ${directionProps.originY ?? 0}`,
            }}
          >
            <div className="space-y-2">
              {children.map((child, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="overflow-hidden"
                >
                  {child}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}