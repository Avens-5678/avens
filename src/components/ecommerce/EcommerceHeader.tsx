import { Search, X, User, ShoppingCart, ChevronDown } from "lucide-react";
import logoEv from "@/assets/logo-ev.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useUserRole } from "@/hooks/useUserRole";

interface EcommerceHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedSearchCategory: string;
  onSearchCategoryChange: (value: string) => void;
}

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

  const getDashboardPath = () => {
    switch (role) {
      case "admin":return "/admin";
      case "client":return "/client/dashboard";
      case "vendor":return "/vendor/dashboard";
      default:return "/auth";
    }
  };

  return (
    <div className="bg-foreground text-primary-foreground sticky top-0 z-50">
      {/* Main header row */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4 h-14 sm:h-16">
          {/* Logo / Brand */}
          <button
            onClick={() => navigate("/")}
            className="flex-shrink-0 flex items-center gap-1 hover:opacity-80 transition-opacity">
            
            <img src={logoEv} alt="Evnting logo" className="h-7 w-auto hidden sm:block" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-primary-foreground">
              Evnting
            </span>
          </button>


          {/* Search bar */}
          
































          

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Profile - mobile: icon only, desktop: with text */}
            <button
              onClick={() => navigate(getDashboardPath())}
              className="flex items-center gap-1.5 text-xs hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded px-2 py-1.5 transition-all">
              
              <User className="h-5 w-5" />
              <div className="text-left hidden lg:block">
                <span className="block text-[10px] text-primary-foreground/60 leading-none">
                  {user ? "Hello" : "Hello, Sign in"}
                </span>
                <span className="block font-semibold text-primary-foreground leading-tight">
                  Account
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate("/ecommerce/orders")}
              className="hidden sm:flex items-center gap-1.5 text-xs hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded px-2 py-1.5 transition-all">
              
              <div className="text-left">
                <span className="block text-[10px] text-primary-foreground/60 leading-none">Returns</span>
                <span className="block font-semibold text-primary-foreground leading-tight">& Orders</span>
              </div>
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-primary-foreground/30 rounded px-2 py-1.5 transition-all relative">
              
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {items.length > 0 &&
                <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                }
              </div>
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>);

};

export default EcommerceHeader;