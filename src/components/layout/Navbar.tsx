import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, LogIn, User, LogOut, Mail, ChevronRight, MapPin, Search, ShoppingBag, Heart, Headphones, Shield, RefreshCw, Lock, MessageSquare, Calendar, Award, HelpCircle, LayoutDashboard } from "lucide-react";
import InquiryForm from "@/components/forms/InquiryForm";
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
      {/* ─── Dark compact header ─── */}
      <div className="bg-evn-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-[52px]">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <span className="text-lg font-brand font-bold italic tracking-tight uppercase text-white">
                Evnting<span className="text-coral-500">.com</span>
              </span>
            </Link>

            {/* Delivery location pill */}
            <button className="hidden lg:flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 transition-colors flex-shrink-0">
              <MapPin className="h-3 w-3 text-evn-400" />
              <span>Hyderabad</span>
              <ChevronRight className="h-3 w-3 rotate-90" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="flex w-full rounded-lg overflow-hidden bg-white/10 hover:bg-white/15 focus-within:bg-white focus-within:ring-1 focus-within:ring-evn-400 transition-all group">
                <input
                  type="text"
                  placeholder="Search equipment, venues, crew..."
                  className="flex-1 px-3 py-2 text-[13px] text-white group-focus-within:text-gray-900 outline-none bg-transparent placeholder:text-white/40 group-focus-within:placeholder:text-gray-400"
                  onFocus={() => navigate("/ecommerce")}
                  readOnly
                />
                <button
                  onClick={() => navigate("/ecommerce")}
                  className="bg-evn-500 hover:bg-evn-400 px-3.5 flex items-center justify-center transition-colors"
                >
                  <Search className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <ThemeToggle />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      <User className="h-4 w-4 text-white/70" />
                      <span className="text-[12px] font-medium text-white/70 hidden lg:inline">Account</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-lg w-52 text-sm">
                    {role === "client" ? (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/client/dashboard?tab=inbox")} className="rounded-md text-[13px]">
                          <MessageSquare className="h-3.5 w-3.5 mr-2" />
                          Inbox
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/client/dashboard?tab=past-orders")} className="rounded-md text-[13px]">
                          <Calendar className="h-3.5 w-3.5 mr-2" />
                          My Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/client/dashboard?tab=loyalty")} className="rounded-md text-[13px]">
                          <Award className="h-3.5 w-3.5 mr-2" />
                          Loyalty
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/client/dashboard?tab=profile")} className="rounded-md text-[13px]">
                          <User className="h-3.5 w-3.5 mr-2" />
                          Profile & Addresses
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/client/dashboard?tab=help")} className="rounded-md text-[13px]">
                          <HelpCircle className="h-3.5 w-3.5 mr-2" />
                          Help & Guide
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => navigate(getDashboardPath())} className="rounded-md text-[13px]">
                        <LayoutDashboard className="h-3.5 w-3.5 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => signOut()} className="rounded-md text-[13px]">
                      <LogOut className="h-3.5 w-3.5 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    <User className="h-4 w-4 text-white/70" />
                    <span className="text-[12px] font-medium text-white/70 hidden lg:inline">Sign In</span>
                  </button>
                </Link>
              )}

              <button
                onClick={() => navigate("/cart")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors relative"
              >
                <span className="relative">
                  <ShoppingBag className="h-4 w-4 text-white/70" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] flex items-center justify-center rounded-full bg-coral-500 text-white text-[8px] font-bold px-0.5">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </span>
                <span className="text-[12px] font-medium text-white/70 hidden lg:inline">Cart</span>
              </button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="rounded-lg bg-white/10 hover:bg-white/20 text-white border-0 px-3.5 h-8 font-medium text-[12px] ml-1"
                  >
                    Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] lg:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-xl">
                  <div className="p-5">
                    <DialogTitle>Contact Us</DialogTitle>
                    <DialogDescription>Get in touch with us for your event planning needs</DialogDescription>
                    <div className="mt-3">
                      <InquiryForm formType="contact" title="Contact Us" />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Category strip */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
              {CATEGORY_LINKS.map((cat) => {
                const active = location.pathname + location.search === cat.href || (cat.label === "All" && location.pathname === "/ecommerce" && !location.search);
                return (
                  <Link
                    key={cat.label}
                    to={cat.href}
                    className={`whitespace-nowrap px-3 py-1.5 text-[11px] font-medium transition-colors border-b-2 ${
                      active
                        ? "text-white border-evn-400 font-semibold"
                        : "text-white/50 border-transparent hover:text-white/80"
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </div>
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
