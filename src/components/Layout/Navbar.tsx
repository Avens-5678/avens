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
    <nav className="bg-foreground/90 backdrop-blur-2xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Center: Logo */}
          <Link to="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <span className="text-white text-xl font-bold tracking-tight">Evnting.com</span>
          </Link>

          {/* Right: Actions (desktop) */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="default" className="gap-2 text-white/70 hover:text-white hover:bg-white/10">
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
                <Button variant="ghost" size="default" className="gap-2 text-white/70 hover:text-white hover:bg-white/10">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm px-5">
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

          {/* Mobile right placeholder for balance */}
          <div className="md:hidden w-10" />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors px-2 py-1.5 rounded-lg ${
                    isActive(link.href)
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to={getDashboardPath()} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="default" className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/10">
                        <User className="h-4 w-4" />
                        My Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" size="default" className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/10" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="default" className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/10">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 w-full" onClick={() => setIsMenuOpen(false)}>
                      Contact Us
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
