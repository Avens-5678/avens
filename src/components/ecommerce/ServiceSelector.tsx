import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import serviceInstarent from "@/assets/service-instarent.png";
import serviceVenues from "@/assets/service-venues.png";
import serviceCrewhub from "@/assets/service-crewhub.png";

interface ServiceSelectorProps {
  activeService: string;
  onServiceChange: (service: string) => void;
}

const services = [
  {
    id: "insta-rent",
    title: "INSTA-RENT",
    subtitle: "EQUIPMENT ON DEMAND",
    highlight: "BROWSE CATALOG",
    image: serviceInstarent,
    navigateTo: null,
  },
  {
    id: "venues",
    title: "VENUES",
    subtitle: "SPACES & LOCATIONS",
    highlight: "EXPLORE NOW",
    image: serviceVenues,
    navigateTo: null,
  },
  {
    id: "crew-hub",
    title: "CREW HUB",
    subtitle: "SKILLED MANPOWER",
    highlight: "HIRE NOW",
    image: serviceCrewhub,
    navigateTo: null,
  },
  {
    id: "essentials",
    title: "ESSENTIALS",
    subtitle: "PARTY SUPPLIES & MORE",
    highlight: "SHOP NOW",
    image: null as string | null,
    navigateTo: "/essentials",
    gradient: "from-rose-400 to-pink-500",
  },
];

const ServiceSelector = ({ activeService, onServiceChange }: ServiceSelectorProps) => {
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    const svc = services.find((s) => s.id === id);
    if (svc?.navigateTo) {
      navigate(svc.navigateTo);
      return;
    }
    onServiceChange(activeService === id ? "" : id);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary-glow overflow-hidden py-10 sm:py-16">
      {/* Decorative glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero text */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            Rent equipment & venues.
            <br />
            Plan your perfect event.
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-brand italic text-white mt-1">
            Evnting it!
          </p>
        </div>

        {/* Desktop: 4 cards */}
        <div className="hidden md:grid md:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {services.map((service) => {
            const isEssentials = service.id === "essentials";
            return (
              <button
                key={service.id}
                onClick={() => handleClick(service.id)}
                className={`group relative rounded-3xl p-6 pb-5 text-left overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 min-h-[240px] flex flex-col ${
                  isEssentials
                    ? "bg-gradient-to-br from-rose-400 to-pink-500 text-white"
                    : "bg-white"
                } ${
                  activeService === service.id
                    ? "ring-2 ring-secondary shadow-2xl -translate-y-1"
                    : "shadow-lg"
                }`}
              >
                <div className="relative z-10 flex-1">
                  <h3 className={`text-lg font-extrabold tracking-wide ${isEssentials ? "text-white" : "text-foreground"}`}>
                    {service.title}
                  </h3>
                  <p className={`text-[11px] mt-1 tracking-widest uppercase ${isEssentials ? "text-white/80" : "text-muted-foreground"}`}>
                    {service.subtitle}
                  </p>
                  <span className={`inline-block mt-4 text-[11px] font-bold px-3.5 py-1.5 rounded-lg tracking-wide ${
                    isEssentials
                      ? "text-rose-600 bg-white/90 border border-white/50"
                      : "text-secondary border border-secondary/30 bg-secondary/5"
                  }`}>
                    {service.highlight}
                  </span>
                </div>

                {/* Image or emoji fallback */}
                <div className="absolute bottom-3 right-3 w-32 h-32 opacity-90 group-hover:scale-105 transition-transform duration-300">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-contain drop-shadow-lg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl opacity-40 select-none">
                      🎉
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div className="relative z-10 mt-auto pt-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isEssentials
                      ? "bg-white/20 group-hover:bg-white group-hover:text-rose-500"
                      : "bg-muted/80 group-hover:bg-primary group-hover:text-white"
                  }`}>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile: 2x2 grid */}
        <div className="md:hidden max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {services.map((service) => {
              const isEssentials = service.id === "essentials";
              return (
                <button
                  key={service.id}
                  onClick={() => handleClick(service.id)}
                  className={`group relative rounded-2xl p-4 text-left overflow-hidden transition-all min-h-[150px] shadow-lg ${
                    isEssentials
                      ? "bg-gradient-to-br from-rose-400 to-pink-500 text-white"
                      : "bg-white"
                  } ${
                    activeService === service.id ? "ring-2 ring-secondary" : ""
                  }`}
                >
                  <div className="relative z-10">
                    <h3 className={`text-sm font-extrabold tracking-wide ${isEssentials ? "text-white" : "text-foreground"}`}>
                      {service.title}
                    </h3>
                    <p className={`text-[9px] mt-0.5 tracking-widest uppercase ${isEssentials ? "text-white/80" : "text-muted-foreground"}`}>
                      {service.subtitle}
                    </p>
                    <span className={`inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      isEssentials
                        ? "text-rose-600 bg-white/90 border border-white/50"
                        : "text-secondary border border-secondary/30 bg-secondary/5"
                    }`}>
                      {service.highlight}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 opacity-90">
                    {service.image ? (
                      <img src={service.image} alt={service.title} className="w-full h-full object-contain drop-shadow-md" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-40 select-none">
                        🎉
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSelector;
