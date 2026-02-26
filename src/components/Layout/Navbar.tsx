import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Menu, X, LogIn, User, LogOut } from "lucide-react";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const getDashboardPath = () => {
    switch (role) {
      case "admin": return "/admin";
      case "client": return "/client/dashboard";
      case "vendor": return "/vendor/dashboard";
      default: return "/";
    }
  };

  const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/ecommerce", label: "Shop" },
    { href: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-foreground sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Desktop layout: 3-column grid for perfect centering */}
        <div className="hidden md:grid grid-cols-3 items-center h-14">
          {/* Left: Nav Links */}
          <div className="flex items-center gap-5">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary-foreground"
                    : "text-primary-foreground/50 hover:text-primary-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-bold tracking-tight">Evnting.com</span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 justify-end">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                    <User className="h-4 w-4 mr-2" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-1.5 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 px-4">
                  Contact Us
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] lg:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
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
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="text-primary-foreground text-lg font-bold tracking-tight">Evnting.com</span>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 px-3 text-xs">
                Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto p-0">
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-primary-foreground/10">
            <div className="flex flex-col space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                    isActive(link.href)
                      ? "text-primary-foreground bg-primary-foreground/10"
                      : "text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-primary-foreground/10 pt-2 mt-1">
                {user ? (
                  <>
                    <Link to={getDashboardPath()} onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary-foreground/5">
                        <User className="h-4 w-4" />
                        My Dashboard
                      </button>
                    </Link>
                    <button className="w-full flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary-foreground/5" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary-foreground/5">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
