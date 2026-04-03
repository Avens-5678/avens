import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Star, Users, Headphones } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatItem {
  Icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  color: string;
  action: string; // navigation path or special action key
}

const STATS: StatItem[] = [
  { Icon: CalendarCheck, value: 500, suffix: "+", label: "Events Delivered", color: "bg-primary/10 text-primary", action: "/ecommerce/orders" },
  { Icon: Star, value: 4.8, suffix: "★", label: "Average Rating", color: "bg-amber-500/10 text-amber-500", action: "#reviews" },
  { Icon: Users, value: 200, suffix: "+", label: "Trusted Vendors", color: "bg-emerald-500/10 text-emerald-500", action: "/ecommerce?sort=rating" },
  { Icon: Headphones, value: 24, suffix: "/7", label: "Support Available", color: "bg-blue-500/10 text-blue-500", action: "whatsapp" },
];

const AnimatedNumber = ({ target, suffix, isVisible }: { target: number; suffix: string; isVisible: boolean }) => {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isVisible) return;
    const isDecimal = !Number.isInteger(target);
    const duration = 1800;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * target;
      setDisplay(isDecimal ? current.toFixed(1) : Math.floor(current).toString());
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isVisible, target]);

  return (
    <span className="text-lg sm:text-3xl font-bold text-foreground tabular-nums">
      {display}
      <span className="text-primary">{suffix}</span>
    </span>
  );
};

const TrustStrip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  const handleStatClick = (action: string) => {
    if (action === "whatsapp") {
      window.open("https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20Evnting", "_blank");
    } else if (action === "#reviews") {
      document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(action);
    }
  };

  return (
    <section ref={ref} className="py-4 sm:py-10 bg-gradient-to-r from-muted/60 via-background to-muted/60 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
          {STATS.map((stat) => (
            <button
              key={stat.label}
              onClick={() => handleStatClick(stat.action)}
              className="flex flex-col items-center text-center gap-1 sm:gap-2 group cursor-pointer hover:scale-105 transition-transform"
            >
              <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full ${stat.color} flex items-center justify-center group-hover:ring-2 group-hover:ring-primary/20 transition-shadow`}>
                <stat.Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" strokeWidth={1.8} />
              </div>
              <AnimatedNumber target={stat.value} suffix={stat.suffix} isVisible={isVisible} />
              <span className="text-[8px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
                {stat.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
