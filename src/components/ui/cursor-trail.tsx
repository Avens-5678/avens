import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CursorTrailProps {
  color?: string;
  size?: number;
  duration?: number;
  enabled?: boolean;
}

export function CursorTrail({ 
  color = '#3b82f6', 
  size = 20, 
  duration = 0.8,
  enabled = true 
}: CursorTrailProps) {
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    // Check for reduced motion preference and mobile
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    
    if (prefersReducedMotion || isMobile) return;

    let lastUpdate = 0;
    const updateMousePosition = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdate < 32) return; // Limit to 30fps for trail
      lastUpdate = now;
      
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const newTrail = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now(),
      };
      
      setTrail(prev => [...prev.slice(-5), newTrail]); // Reduced trail length
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="absolute rounded-full"
          style={{
            left: point.x - size / 2,
            top: point.y - size / 2,
            width: size,
            height: size,
            background: `radial-gradient(circle, ${color}40, transparent)`,
          }}
          initial={{ opacity: 0.8, scale: 0.5 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration }}
        />
      ))}
    </div>
  );
}