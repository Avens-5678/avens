import { useEffect, useState } from "react";
import { Check, Heart, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  show: boolean;
  title?: string;
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export const SuccessAnimation = ({ 
  show, 
  title = "Success!", 
  message = "Your message has been sent!", 
  onComplete,
  duration = 3000 
}: SuccessAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Generate particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5
      }));
      setParticles(newParticles);

      // Auto hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show && !isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm",
      isVisible ? "animate-fade-in" : "animate-fade-out"
    )}>
      <div className="relative bg-background rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full border animate-scale-in">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-10 h-10 text-white animate-pulse" />
            </div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 w-20 h-20 bg-green-400/30 rounded-full animate-ping"></div>
            <div className="absolute inset-2 w-16 h-16 bg-green-400/20 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-muted-foreground">
            {message}
          </p>
        </div>

        {/* Floating particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          >
            {particle.id % 4 === 0 && <Star className="w-4 h-4 text-yellow-400 animate-bounce" />}
            {particle.id % 4 === 1 && <Heart className="w-4 h-4 text-pink-400 animate-pulse" />}
            {particle.id % 4 === 2 && <Zap className="w-4 h-4 text-blue-400 animate-spin" />}
            {particle.id % 4 === 3 && <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>}
          </div>
        ))}

        {/* Sparkle background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-4 right-6 w-1 h-1 bg-yellow-400 rounded-full animate-twinkle"></div>
          <div className="absolute top-8 left-8 w-1 h-1 bg-blue-400 rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-6 right-4 w-1 h-1 bg-pink-400 rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-8 left-6 w-1 h-1 bg-green-400 rounded-full animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>
    </div>
  );
};