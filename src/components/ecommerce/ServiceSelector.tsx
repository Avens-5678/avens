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
    wide: true,
  },
  {
    id: "venues",
    title: "VENUES",
    subtitle: "SPACES & LOCATIONS",
    highlight: "EXPLORE NOW",
    image: serviceVenues,
    wide: false,
  },
  {
    id: "crew-hub",
    title: "CREW HUB",
    subtitle: "SKILLED MANPOWER",
    highlight: "HIRE NOW",
    image: serviceCrewhub,
    wide: false,
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
    <section className="bg-primary py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Hero text */}
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary-foreground leading-tight">
            Rent equipment & venues.
            <br />
            Plan your perfect event.
            <br />
            <span className="font-brand italic">Evnting it!</span>
          </h2>
        </div>

        {/* Service cards — Swiggy layout: 1 wide on top, 2 below on mobile; 3 side by side on desktop */}
        <div className="max-w-4xl mx-auto">
          {/* Desktop: 3 equal cards */}
          <div className="hidden md:grid md:grid-cols-3 gap-5">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleClick(service.id)}
                className={`group relative bg-card rounded-2xl p-5 text-left overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] min-h-[220px] flex flex-col justify-between ${
                  activeService === service.id ? "ring-2 ring-secondary shadow-xl scale-[1.02]" : ""
                }`}
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 tracking-wide">
                    {service.subtitle}
                  </p>
                  <span className="inline-block mt-3 text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-md">
                    {service.highlight}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 w-28 h-28 opacity-90">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                {/* Arrow */}
                <div className="absolute bottom-4 left-5 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Mobile: 1 wide card on top, 2 cards below */}
          <div className="md:hidden space-y-4">
            {/* First card — full width */}
            <button
              onClick={() => handleClick(services[0].id)}
              className={`group relative w-full bg-card rounded-2xl p-5 text-left overflow-hidden transition-all duration-300 min-h-[160px] flex flex-col justify-between ${
                activeService === services[0].id ? "ring-2 ring-secondary" : ""
              }`}
            >
              <div className="relative z-10">
                <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                  {services[0].title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 tracking-wide">
                  {services[0].subtitle}
                </p>
                <span className="inline-block mt-3 text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-md">
                  {services[0].highlight}
                </span>
              </div>
              <div className="absolute bottom-0 right-2 w-32 h-32 opacity-90">
                <img src={services[0].image} alt={services[0].title} className="w-full h-full object-contain" loading="lazy" />
              </div>
            </button>

            {/* Two cards side by side */}
            <div className="grid grid-cols-2 gap-3">
              {services.slice(1).map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleClick(service.id)}
                  className={`group relative bg-card rounded-2xl p-4 text-left overflow-hidden transition-all duration-300 min-h-[180px] flex flex-col justify-between ${
                    activeService === service.id ? "ring-2 ring-secondary" : ""
                  }`}
                >
                  <div className="relative z-10">
                    <h3 className="text-base font-extrabold text-foreground tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">
                      {service.subtitle}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
                      {service.highlight}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 opacity-90">
                    <img src={service.image} alt={service.title} className="w-full h-full object-contain" loading="lazy" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSelector;
