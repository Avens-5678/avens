import { ArrowRight } from "lucide-react";
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
  },
  {
    id: "venues",
    title: "VENUES",
    subtitle: "SPACES & LOCATIONS",
    highlight: "EXPLORE NOW",
    image: serviceVenues,
  },
  {
    id: "crew-hub",
    title: "CREW HUB",
    subtitle: "SKILLED MANPOWER",
    highlight: "HIRE NOW",
    image: serviceCrewhub,
  },
];

const ServiceSelector = ({ activeService, onServiceChange }: ServiceSelectorProps) => {

  const handleClick = (id: string) => {
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

        {/* Desktop: 3 cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleClick(service.id)}
              className={`group relative bg-white rounded-3xl p-6 pb-5 text-left overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 min-h-[240px] flex flex-col ${
                activeService === service.id
                  ? "ring-2 ring-secondary shadow-2xl -translate-y-1"
                  : "shadow-lg"
              }`}
            >
              <div className="relative z-10 flex-1">
                <h3 className="text-lg font-extrabold text-foreground tracking-wide">
                  {service.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 tracking-widest uppercase">
                  {service.subtitle}
                </p>
                <span className="inline-block mt-4 text-[11px] font-bold text-secondary border border-secondary/30 bg-secondary/5 px-3.5 py-1.5 rounded-lg tracking-wide">
                  {service.highlight}
                </span>
              </div>

              {/* Image */}
              <div className="absolute bottom-3 right-3 w-32 h-32 opacity-90 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-contain drop-shadow-lg"
                  loading="lazy"
                />
              </div>

              {/* Arrow */}
              <div className="relative z-10 mt-auto pt-4">
                <div className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile: 1 wide + 2 below */}
        <div className="md:hidden space-y-3 max-w-md mx-auto">
          <button
            onClick={() => handleClick(services[0].id)}
            className={`group relative w-full bg-white rounded-2xl p-5 text-left overflow-hidden transition-all min-h-[150px] shadow-lg ${
              activeService === services[0].id ? "ring-2 ring-secondary" : ""
            }`}
          >
            <div className="relative z-10">
              <h3 className="text-lg font-extrabold text-foreground tracking-wide">{services[0].title}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 tracking-widest uppercase">{services[0].subtitle}</p>
              <span className="inline-block mt-3 text-[10px] font-bold text-secondary border border-secondary/30 bg-secondary/5 px-3 py-1 rounded-md">
                {services[0].highlight}
              </span>
            </div>
            <div className="absolute bottom-0 right-1 w-28 h-28 opacity-90">
              <img src={services[0].image} alt={services[0].title} className="w-full h-full object-contain drop-shadow-md" loading="lazy" />
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {services.slice(1).map((service) => (
              <button
                key={service.id}
                onClick={() => handleClick(service.id)}
                className={`group relative bg-white rounded-2xl p-4 text-left overflow-hidden transition-all min-h-[170px] shadow-lg ${
                  activeService === service.id ? "ring-2 ring-secondary" : ""
                }`}
              >
                <div className="relative z-10">
                  <h3 className="text-sm font-extrabold text-foreground tracking-wide">{service.title}</h3>
                  <p className="text-[9px] text-muted-foreground mt-0.5 tracking-widest uppercase">{service.subtitle}</p>
                  <span className="inline-block mt-2 text-[9px] font-bold text-secondary border border-secondary/30 bg-secondary/5 px-2 py-0.5 rounded-md">
                    {service.highlight}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-20 h-20 opacity-90">
                  <img src={service.image} alt={service.title} className="w-full h-full object-contain drop-shadow-md" loading="lazy" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSelector;
