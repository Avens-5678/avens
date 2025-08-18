import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Github } from "lucide-react";
import { useEvents } from "@/hooks/useData";
// Import the video file directly from the assets folder
import logoVideo from "@/assets/Logo_Animation_Video_Generation.mp4";

const Footer = () => {
  const { data: events } = useEvents();
  
  return <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info with Video Logo */}
          <div className="space-y-4">
            <div className="w-32 h-auto">
              <video
                src={logoVideo} // Use the imported video variable here
                title="Avens Expositions Animated Logo" // Using title for accessibility instead of alt
                className="w-full h-auto"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
            <p className="text-muted-foreground text-sm">
              Creating unforgettable experiences with exceptional event management and premium rental services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com/lyora-dev/avens" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/services" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Services
              </Link>
              <Link to="/portfolio" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Portfolio
              </Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Blog
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Services</h4>
            <div className="space-y-2">
              {events?.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.event_type}`}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {event.title}
                </Link>
              ))}
              <Link to="/ecommerce" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Equipment Rental
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 9849085678</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@avens.in</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>1st Floor. TFO Building Hitex, Izzathnagar, Hyderabad, Telangana 500049</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Avens Events. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;
