import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, ArrowUpRight } from "lucide-react";
import { useEvents } from "@/hooks/useData";

const Footer = () => {
  const { data: events } = useEvents();
  
  return (
    <footer className="bg-foreground text-white/70">
      <div className="container mx-auto px-5 sm:px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-5 lg:col-span-1">
            <div>
              <span className="text-white text-2xl font-display font-bold tracking-tight">
                Evnting<span className="text-secondary">.com</span>
              </span>
              <div className="text-white/40 text-sm mt-1">Online platform for event production</div>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              Creating unforgettable experiences with exceptional event management and premium rental services.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-xl bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/services", label: "Services" },
                { to: "/portfolio", label: "Portfolio" },
                { to: "/about", label: "About" },
                { to: "/blog", label: "Blog" },
                { to: "/faq", label: "FAQ" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center text-sm text-white/40 hover:text-white transition-colors duration-300"
                >
                  {label}
                  <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-5">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Services</h4>
            <div className="space-y-3">
              {events?.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.event_type}`}
                  className="group flex items-center text-sm text-white/40 hover:text-white transition-colors duration-300"
                >
                  {event.title}
                  <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              <Link
                to="/ecommerce"
                className="group flex items-center text-sm text-white/40 hover:text-white transition-colors duration-300"
              >
                Equipment Rental
                <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-4">
              {[
                { icon: Phone, text: "+91 9849085678" },
                { icon: Mail, text: "info@evnting.com" },
                { icon: MapPin, text: "1st Floor. TFO Building Hitex, Izzathnagar, Hyderabad, Telangana 500049" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start space-x-3 text-sm">
                  <div className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-white/50" />
                  </div>
                  <span className="text-white/40 leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © 2026 Evnting. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
