import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#18181B] text-white/70">
      {/* Main Footer — compact */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="space-y-3 col-span-2 md:col-span-1">
            <div>
              <span className="text-white text-base font-brand font-bold italic tracking-tight uppercase">
                Evnting<span className="text-coral-500">.com</span>
              </span>
              <div className="text-white/40 text-[11px] mt-0.5">India's event rental marketplace</div>
            </div>
            <p className="text-[11px] leading-relaxed text-white/40">
              Creating unforgettable experiences with exceptional event management.
            </p>
            <div className="flex space-x-2">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-lg bg-white/6 hover:bg-evn-600/20 flex items-center justify-center text-white/40 hover:text-evn-400 transition-all duration-300"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-[11px] uppercase tracking-wider">Marketplace</h4>
            <div className="space-y-1.5">
              {[
                { to: "/ecommerce", label: "Equipment Rental" },
                { to: "/ecommerce?service=venue", label: "Venues" },
                { to: "/ecommerce?service=crew", label: "Crew Hub" },
                { to: "/essentials", label: "Event Essentials" },
                { to: "/ecommerce/orders", label: "Track Order" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center text-[11px] text-white/40 hover:text-white transition-colors duration-300"
                >
                  {label}
                  <ArrowUpRight className="h-2.5 w-2.5 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* For Vendors */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-[11px] uppercase tracking-wider">For Vendors</h4>
            <div className="space-y-1.5">
              {[
                { to: "/auth?register=vendor", label: "Become a Vendor" },
                { to: "/vendor/dashboard", label: "Vendor Dashboard" },
                { to: "/faq", label: "Vendor FAQ" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center text-[11px] text-white/40 hover:text-white transition-colors duration-300"
                >
                  {label}
                  <ArrowUpRight className="h-2.5 w-2.5 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-[11px] uppercase tracking-wider">Contact</h4>
            <div className="space-y-2">
              {[
                { icon: Phone, text: "+91 9849085678" },
                { icon: Mail, text: "info@evnting.com" },
                { icon: MapPin, text: "TFO Building Hitex, Hyderabad 500049" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start space-x-2 text-[11px]">
                  <Icon className="h-3 w-3 text-white/40 flex-shrink-0 mt-0.5" />
                  <span className="text-white/40 leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/8 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-white/30">© 2026 Evnting. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-white/20 text-[10px]">
            <span className="px-1.5 py-0.5 bg-white/5 rounded">UPI</span>
            <span className="px-1.5 py-0.5 bg-white/5 rounded">Visa</span>
            <span className="px-1.5 py-0.5 bg-white/5 rounded">Mastercard</span>
            <span className="px-1.5 py-0.5 bg-white/5 rounded">Razorpay</span>
          </div>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
