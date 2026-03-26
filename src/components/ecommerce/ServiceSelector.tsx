import { Zap, Building2, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceSelectorProps {
  activeService: string;
  onServiceChange: (service: string) => void;
}

const services = [
  {
    id: "insta-rent",
    icon: Zap,
    title: "Insta-Rent",
    subtitle: "Equipment on demand",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: "venues",
    icon: Building2,
    title: "Venues",
    subtitle: "Spaces & locations",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "crew-hub",
    icon: UsersRound,
    title: "Crew Hub",
    subtitle: "Skilled manpower",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const ServiceSelector = ({ activeService, onServiceChange }: ServiceSelectorProps) => {
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    if (id === "crew-hub") {
      navigate("/services");
      return;
    }
    onServiceChange(activeService === id ? "" : id);
  };

  return (
    <section className="bg-background border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-8">
          {services.map((service) => {
            const isActive = activeService === service.id;
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => handleClick(service.id)}
                className={`group relative flex items-center gap-3 sm:gap-4 px-5 sm:px-7 py-3 sm:py-4 rounded-2xl border-2 transition-all duration-300 min-w-[120px] sm:min-w-[180px] ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-md hover:scale-[1.01]"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${service.gradient} text-white shadow-sm`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    {service.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight mt-0.5 hidden sm:block">
                    {service.subtitle}
                  </p>
                </div>
                {isActive && (
                  <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceSelector;
