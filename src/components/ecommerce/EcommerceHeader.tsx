import { useState } from "react";
import { Search, X, User, ShoppingCart, Menu, Home, Briefcase, Image, Info, BookOpen, HelpCircle, Users, Package, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useUserRole } from "@/hooks/useUserRole";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface EcommerceHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedSearchCategory: string;
  onSearchCategoryChange: (value: string) => void;
}

const menuLinks = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/portfolio", label: "Portfolio", icon: Image },
  { href: "/ecommerce", label: "Rental", icon: Package },
  { href: "/about", label: "About", icon: Info },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/team", label: "Team", icon: Users },
];

const EcommerceHeader = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedSearchCategory,
  onSearchCategoryChange
}: EcommerceHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useUserRole();
  const { items } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const getDashboardPath = () => {
    switch (role) {
      case "admin": return "/admin";
      case "client": return "/client/dashboard";
      case "vendor": return "/vendor/dashboard";
      default: return "/auth";
    }
  };

  return (
    <div className="bg-foreground text-primary-foreground sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4 h-14 sm:h-16">
          {/* Menu + Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="flex items-center justify-center hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded p-1.5 transition-all"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-foreground border-r border-white/10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="p-5 border-b border-white/10">
                  <span className="text-primary-foreground text-xl font-brand font-bold italic tracking-tight uppercase">
                    Evnting<span className="text-secondary">.com</span>
                  </span>
                </div>
                <nav className="flex flex-col py-2">
                  {menuLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-5 py-3 text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/5 transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-30" />
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <span className="text-lg sm:text-xl font-brand font-bold italic tracking-tight uppercase text-primary-foreground">
                Evnting
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="flex-1 flex items-center min-w-0">
            <div className="flex w-full rounded-lg overflow-hidden bg-primary-foreground">
              <select
                value={selectedSearchCategory}
                onChange={(e) => onSearchCategoryChange(e.target.value)}
                className="hidden sm:block bg-muted text-foreground text-xs font-medium px-3 py-2 border-r border-border outline-none cursor-pointer hover:bg-muted/80 max-w-[140px]"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search equipment, decor, lighting..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full px-4 py-2.5 text-foreground text-sm outline-none bg-transparent placeholder:text-muted-foreground"
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button className="bg-secondary hover:bg-secondary/90 px-4 flex items-center justify-center transition-colors">
                <Search className="h-5 w-5 text-secondary-foreground" />
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => navigate(getDashboardPath())}
              className="flex items-center gap-1.5 text-xs hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded px-2 py-1.5 transition-all"
            >
              <User className="h-5 w-5" />
              <div className="text-left hidden lg:block">
                <span className="block text-[10px] text-primary-foreground/60 leading-none">
                  {user ? "Hello" : "Hello, Sign in"}
                </span>
                <span className="block font-semibold text-primary-foreground leading-tight">Account</span>
              </div>
            </button>
            <button
              onClick={() => navigate("/ecommerce/orders")}
              className="hidden sm:flex items-center gap-1.5 text-xs hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded px-2 py-1.5 transition-all"
            >
              <div className="text-left">
                <span className="block text-[10px] text-primary-foreground/60 leading-none">Your</span>
                <span className="block font-semibold text-primary-foreground leading-tight">Orders</span>
              </div>
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded px-2 py-1.5 transition-all relative"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommerceHeader;