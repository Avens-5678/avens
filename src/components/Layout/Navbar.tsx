import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Menu, X, LogIn, User, LogOut, Mail, ChevronRight } from "lucide-react";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileContactOpen, setIsMobileContactOpen] = useState(false);
  const location = useLocation();

  const getDashboardPath = () => {
    switch (role) {
      case "admin": return "/admin";
      case "client": return "/client/dashboard";
      case "vendor": return "/vendor/dashboard";
      default: return "/auth";
    }
  };

  const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/ecommerce", label: "Rental" },
    { href: "/about", label: "About" },
  ];

  const mobileNavLinks = [
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/ecommerce", label: "Rental" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" },
    { href: "/team", label: "Team" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-dark sticky top-0 z-50">
      <div className="container mx-auto px-5 sm:px-6">
        {/* Desktop layout: 3-column grid */}
        <div className="hidden md:grid grid-cols-3 items-center h-16">
          {/* Left: Nav Links */}
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-[13px] font-medium tracking-wide uppercase transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-white"
                    : "text-white/50 hover:text-white/85"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex items-center justify-center">
            <span className="text-white text-xl font-brand font-bold italic tracking-tight uppercase">
              Evnting<span className="text-secondary">.com</span>
            </span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 justify-end">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-white/55 hover:text-white hover:bg-white/8 rounded-xl">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())} className="rounded-lg">
                    <User className="h-4 w-4 mr-2" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className="rounded-lg">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-1.5 text-white/55 hover:text-white hover:bg-white/8 rounded-xl">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-full bg-secondary hover:bg-secondary/90 text-white border-0 px-5 font-semibold text-[13px] shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Contact Us
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] lg:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
                <div className="p-6">
                  <DialogTitle>Contact Us</DialogTitle>
                  <DialogDescription>Get in touch with us for your event planning needs</DialogDescription>
                  <div className="mt-4">
                    <InquiryForm formType="contact" title="Contact Us" />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex md:hidden items-center justify-between h-14">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/8 rounded-xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="text-white text-lg font-display font-bold tracking-tight">
              Evnting<span className="text-secondary">.com</span>
            </span>
          </Link>

          <div className="w-10" aria-hidden="true" />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/8 animate-fade-in">
            <div className="flex flex-col space-y-1">
              {mobileNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center justify-between text-sm font-medium transition-all px-4 py-3 rounded-xl ${
                    isActive(link.href)
                      ? "text-white bg-white/10"
                      : "text-white/55 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </Link>
              ))}
              <div className="border-t border-white/8 pt-3 mt-2 space-y-1">
                <button
                  className="w-full flex items-center gap-3 text-sm text-white/55 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMobileContactOpen(true);
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Contact Us
                </button>

                {user ? (
                  <>
                    <Link to={getDashboardPath()} onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full flex items-center gap-3 text-sm text-white/55 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                        <User className="h-4 w-4" />
                        My Dashboard
                      </button>
                    </Link>
                    <button
                      className="w-full flex items-center gap-3 text-sm text-white/55 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                      onClick={() => { signOut(); setIsMenuOpen(false); }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full flex items-center gap-3 text-sm text-white/55 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <Dialog open={isMobileContactOpen} onOpenChange={setIsMobileContactOpen}>
          <DialogContent className="w-[calc(100%-1rem)] max-w-md max-h-[90dvh] overflow-y-auto p-0 rounded-2xl">
            <div className="p-5 sm:p-6">
              <DialogTitle>Contact Us</DialogTitle>
              <DialogDescription>Get in touch with us for your event planning needs</DialogDescription>
              <div className="mt-4">
                <InquiryForm formType="contact" title="Contact Us" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
};

export default Navbar;
