import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Menu, X } from "lucide-react";
import InquiryForm from "@/components/Forms/InquiryForm";

const Navbar = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/about", label: "About" },
    { href: "/team", label: "Team" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Avens Pvt.Ltd
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-hover"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300">
                  Contact Us
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] lg:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <div className="p-6">
                  <DialogTitle>Contact Us</DialogTitle>
                  <DialogDescription>Get in touch with us for your event planning needs</DialogDescription>
                  <div className="mt-4">
                    <InquiryForm 
                      formType="contact"
                      title="Contact Us"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-hover"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="self-start bg-gradient-to-r from-primary to-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact Us
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto p-0">
                  <div className="p-6">
                    <DialogTitle>Contact Us</DialogTitle>
                    <DialogDescription>Get in touch with us for your event planning needs</DialogDescription>
                    <div className="mt-4">
                      <InquiryForm 
                        formType="contact"
                        title="Contact Us"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;