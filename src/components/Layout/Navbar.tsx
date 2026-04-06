import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Menu, X, LogIn, User, LogOut, Mail, ChevronRight, MapPin, Search, ShoppingBag, Heart, Headphones, Shield, RefreshCw, Lock } from "lucide-react";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isNative } from "@/utils/platform";
import { useCart } from "@/hooks/useCart";

const CATEGORY_LINKS = [
  { label: "All", href: "/ecommerce" },
  { label: "Sound & Audio", href: "/ecommerce?category=Sound+%26+DJ" },
  { label: "Lighting", href: "/ecommerce?category=Lighting" },
  { label: "Stages", href: "/ecommerce?category=Stages" },
  { label: "Tents", href: "/ecommerce?category=Tents+%26+Structures" },
  { label: "Furniture", href: "/ecommerce?category=Furniture" },
  { label: "Catering", href: "/ecommerce?category=Catering+Equipment" },
  { label: "Venues", href: "/ecommerce?service=venue" },
  { label: "DJs & Music", href: "/ecommerce?service=crew&category=DJ" },
  { label: "Photography", href: "/ecommerce?service=crew&category=Photography" },
  { label: "Decoration", href: "/ecommerce?category=Decor+%26+Floral" },
  { label: "Essentials", href: "/essentials" },
];

const Navbar = () => {
  // Hide entire navbar on mobile / native — MobileBottomNav handles navigation
  if (isNative()) return null;
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileContactOpen, setIsMobileContactOpen] = useState(false);
  const location = useLocation();
  const { items } = useCart();
  const cartCount = items.length;

  const getDashboardPath = () => {
    switch (role) {
      case "admin": return "/admin";
      case "client": return "/client/dashboard";
      case "vendor": return "/vendor/dashboard";
      default: return "/auth";
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 hidden md:block" style={{ paddingTop: "var(--safe-area-top)" }}>
      {/* ─── Top Bar — slim utility strip ─── */}
      <div className="bg-evn-950 text-white/70">
        <div className="container mx-auto px-5 sm:px-6 flex items-center justify-between h-8">
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-3 w-3 text-evn-400" />
            <span>Deliver to: <strong className="text-white/90">Hyderabad</strong></span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/auth?register=vendor" className="hover:text-white transition-colors">Become a Vendor</Link>
            <span className="text-white/20">|</span>
            <Link to="/faq" className="hover:text-white transition-colors">Help</Link>
          </div>
        </div>
      </div>

      {/* ─── Main Header ─── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="flex items-center gap-6 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <span className="text-xl font-brand font-bold italic tracking-tight uppercase text-evn-950">
                Evnting<span className="text-coral-500">.com</span>
              </span>
            </Link>

            {/* Search Bar — 60% center */}
            <div className="flex-1 max-w-2xl">
              <div className="flex w-full rounded-full overflow-hidden border-2 border-evn-600 hover:border-evn-500 transition-colors bg-white">
                <button
                  onClick={() => navigate("/ecommerce")}
                  className="hidden lg:flex items-center gap-1 px-4 text-xs font-medium text-gray-600 bg-gray-50 border-r border-gray-200 hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  All Categories
                  <ChevronRight className="h-3 w-3 rotate-90" />
                </button>
                <input
                  type="text"
                  placeholder="Search for equipment, venues, crew..."
                  className="flex-1 px-4 py-2.5 text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
                  onFocus={() => navigate("/ecommerce")}
                  readOnly
                />
                <button
                  onClick={() => navigate("/ecommerce")}
                  className="bg-evn-600 hover:bg-evn-700 px-5 flex items-center justify-center transition-colors"
                >
                  <Search className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <ThemeToggle />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <User className="h-5 w-5 text-gray-700" />
                      <span className="text-[10px] font-medium text-gray-600">Account</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-48">
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
                  <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <User className="h-5 w-5 text-gray-700" />
                    <span className="text-[10px] font-medium text-gray-600">Sign In</span>
                  </button>
                </Link>
              )}

              <button
                onClick={() => navigate("/cart")}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors relative"
              >
                <span className="relative">
                  <ShoppingBag className="h-5 w-5 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-evn-600 text-white text-[9px] font-bold px-1">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium text-gray-600">Cart</span>
              </button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="rounded-full bg-evn-600 hover:bg-evn-700 text-white border-0 px-5 font-semibold text-[13px] shadow-md hover:shadow-lg transition-all duration-300 ml-2"
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
        </div>
      </div>

      {/* ─── Category Navigation Strip ─── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
            {CATEGORY_LINKS.map((cat) => {
              const active = location.pathname + location.search === cat.href || (cat.label === "All" && location.pathname === "/ecommerce" && !location.search);
              return (
                <Link
                  key={cat.label}
                  to={cat.href}
                  className={`whitespace-nowrap px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? "text-evn-700 bg-evn-50 font-semibold"
                      : "text-gray-600 hover:text-evn-700 hover:bg-gray-50"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Contact Dialog (preserved from original) */}
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
    </nav>
  );
};

export default Navbar;
