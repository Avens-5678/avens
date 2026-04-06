import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#18181B] text-white/70">
      {/* Trust Strip */}
      <div className="border-b border-white/8">
        <div className="container mx-auto px-5 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "shield", label: "Verified Vendors", desc: "Every vendor vetted" },
              { icon: "lock", label: "Secure Payments", desc: "Razorpay protected" },
              { icon: "refresh", label: "Easy Returns", desc: "Hassle-free process" },
              { icon: "headphones", label: "24/7 Support", desc: "Always here to help" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-evn-600/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-evn-400 text-lg">
                    {item.icon === "shield" && "🛡️"}
                    {item.icon === "lock" && "🔒"}
                    {item.icon === "refresh" && "🔄"}
                    {item.icon === "headphones" && "🎧"}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                  <p className="text-white/40 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-5 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-5 lg:col-span-1">
            <div>
              <span className="text-white text-2xl font-brand font-bold italic tracking-tight uppercase">
                Evnting<span className="text-coral-500">.com</span>
              </span>
              <div className="text-white/40 text-sm mt-1">India's event rental marketplace</div>
            </div>
            <p className="text-sm leading-relaxed text-white/40">
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
                  className="w-10 h-10 rounded-xl bg-white/6 hover:bg-evn-600/20 hover:border-evn-600/30 border border-transparent flex items-center justify-center text-white/40 hover:text-evn-400 transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-5">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Marketplace</h4>
            <div className="space-y-3">
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
                  className="group flex items-center text-sm text-white/40 hover:text-white transition-colors duration-300"
                >
                  {label}
                  <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* For Vendors */}
          <div className="space-y-5">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">For Vendors</h4>
            <div className="space-y-3">
              {[
                { to: "/auth?register=vendor", label: "Become a Vendor" },
                { to: "/vendor/dashboard", label: "Vendor Dashboard" },
                { to: "/faq", label: "Vendor FAQ" },
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

          {/* Contact Info */}
          <div className="space-y-5">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-4">
              {[
                { icon: Phone, text: "+91 9849085678" },
                { icon: Mail, text: "info@evnting.com" },
                { icon: MapPin, text: "1st Floor, TFO Building Hitex, Izzathnagar, Hyderabad, Telangana 500049" },
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

        {/* Bottom Bar */}
        <div className="border-t border-white/8 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © 2026 Evnting. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/20 text-xs">
              <span className="px-2 py-1 bg-white/5 rounded">UPI</span>
              <span className="px-2 py-1 bg-white/5 rounded">Visa</span>
              <span className="px-2 py-1 bg-white/5 rounded">Mastercard</span>
              <span className="px-2 py-1 bg-white/5 rounded">Razorpay</span>
            </div>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
