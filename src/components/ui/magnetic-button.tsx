import { ReactNode, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  strength?: number;
  onClick?: () => void;
  asChild?: boolean;
  [key: string]: any;
}

export const MagneticButton = ({
  children,
  className,
  variant = 'default',
  size = 'default',
  strength = 20,
  onClick,
  asChild,
  ...props
}: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;
    
    setPosition({
      x: deltaX * strength,
      y: deltaY * strength
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'transition-transform duration-200 ease-out will-change-transform',
        'hover:scale-105 active:scale-95',
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      asChild={asChild}
      {...props}
    >
      {children}
    </Button>
  );
};

export default MagneticButton;