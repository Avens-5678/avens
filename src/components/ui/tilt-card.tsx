import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltDegree?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
  glareColor?: string;
  glarePosition?: string;
  glareBorderRadius?: string;
}

export function TiltCard({
  children,
  className,
  tiltDegree = 20,
  perspective = 1000,
  scale = 1.05,
  speed = 300,
  glareEnable = true,
  glareMaxOpacity = 0.7,
  glareColor = '#ffffff',
  glarePosition = 'bottom',
  glareBorderRadius = '0',
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltDegree, -tiltDegree]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltDegree, tiltDegree]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        rotateY: rotateY,
        rotateX: rotateX,
        transformStyle: 'preserve-3d',
        perspective: perspective,
      }}
      animate={{
        scale: isHovered ? scale : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: speed,
        damping: 30,
      }}
      className={cn('relative', className)}
    >
      <div style={{ transform: 'translateZ(75px)' }}>
        {children}
      </div>
      
      {glareEnable && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            background: `linear-gradient(135deg, transparent 40%, ${glareColor}${Math.round(glareMaxOpacity * 255).toString(16)} 50%, transparent 60%)`,
            borderRadius: glareBorderRadius,
            transform: 'translateZ(100px)',
          }}
          animate={{
            opacity: isHovered ? glareMaxOpacity : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}