import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Award, Users, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

interface BenefitCardProps {
  icon: ReactNode;
  number: string;
  title: string;
  description: string;
  delay?: number;
}

function BenefitCard({ icon, number, title, description, delay = 0 }: BenefitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 lg:p-8",
        "bg-card/80 backdrop-blur-sm border border-border/60",
        "hover:border-primary/40 hover:shadow-lg transition-all duration-300"
      )}
    >
      {/* Background glow effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
      
      <div className="relative z-10 space-y-4">
        {/* Icon container */}
        <div className={cn(
          "inline-flex items-center justify-center w-14 h-14 rounded-xl",
          "bg-primary/10 border border-primary/20",
          "group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-6",
          "transition-all duration-300"
        )}>
          <div className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>

        {/* Number */}
        <div className="text-3xl lg:text-4xl font-bold text-foreground font-mono tracking-tight">
          {number}
        </div>

        {/* Title */}
        <h3 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function WhyChooseUs() {
  const benefits = [
    {
      icon: <Award className="h-full w-full" />,
      number: "500+",
      title: "Events Delivered",
      description: "Successfully executed events ranging from intimate gatherings to large-scale productions."
    },
    {
      icon: <Users className="h-full w-full" />,
      number: "Expert",
      title: "Professional Team",
      description: "Dedicated event specialists with years of experience in creating unforgettable experiences."
    },
    {
      icon: <Clock className="h-full w-full" />,
      number: "24/7",
      title: "Support Available",
      description: "Round-the-clock assistance to ensure your event runs smoothly from start to finish."
    },
    {
      icon: <Star className="h-full w-full" />,
      number: "Premium",
      title: "Quality Guaranteed",
      description: "Top-tier equipment and services backed by our commitment to excellence."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {benefits.map((benefit, index) => (
        <BenefitCard
          key={benefit.title}
          {...benefit}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
