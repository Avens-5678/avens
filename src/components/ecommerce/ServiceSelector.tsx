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
    title: "Insta-Rent",
    highlight: "Browse",
    image: serviceInstarent,
    navigateTo: null,
    gradient: "from-indigo-500 to-evn-600",
  },
  {
    id: "venues",
    title: "Venues",
    highlight: "Explore",
    image: serviceVenues,
    navigateTo: null,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "crew-hub",
    title: "Crew Hub",
    highlight: "Hire",
    image: serviceCrewhub,
    navigateTo: null,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "essentials",
    title: "Essentials",
    highlight: "Shop",
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
    <section className="bg-gradient-to-r from-evn-700 via-evn-600 to-evn-800 py-3 sm:py-4">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Desktop: 4 cards in a row */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleClick(service.id)}
              className={`group relative rounded-xl text-left overflow-hidden transition-all duration-300 hover:scale-[1.03] h-[100px] bg-gradient-to-br ${service.gradient} ${
                activeService === service.id ? "ring-2 ring-white/60 scale-[1.03]" : ""
              }`}
            >
              <div className="relative z-10 p-3">
                <h3 className="text-[13px] font-bold text-white">
                  {service.title}
                </h3>
                <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-white/90">
                  {service.highlight} <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <div className="absolute bottom-0 right-1 w-16 h-16 opacity-60">
                {service.image ? (
                  <img src={service.image} alt={service.title} className="w-full h-full object-contain brightness-0 invert" loading="lazy" />
                ) : (
                  <span className="text-4xl opacity-40 select-none absolute bottom-1 right-1">🎉</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleClick(service.id)}
                className={`group relative rounded-lg text-left overflow-hidden transition-all h-[80px] w-[120px] flex-shrink-0 bg-gradient-to-br ${service.gradient} ${
                  activeService === service.id ? "ring-2 ring-white/60" : ""
                }`}
              >
                <div className="relative z-10 p-2.5">
                  <h3 className="text-[11px] font-bold text-white">
                    {service.title}
                  </h3>
                  <span className="inline-flex items-center gap-0.5 mt-1 text-[9px] font-semibold text-white/90">
                    {service.highlight} <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-12 h-12 opacity-60">
                  {service.image ? (
                    <img src={service.image} alt={service.title} className="w-full h-full object-contain brightness-0 invert" loading="lazy" />
                  ) : (
                    <span className="text-2xl opacity-40 select-none absolute bottom-1 right-1">🎉</span>
                  )}
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
