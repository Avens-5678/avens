import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface MobileBottomNavProps {
  cartCount: number;
}

const MobileBottomNav = ({ cartCount }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { role } = useUserRole();

  const getAccountPath = () => {
    if (!user) return "/auth";
    if (role === "admin") return "/admin";
    if (role === "vendor") return "/vendor-dashboard";
    if (role === "client") return "/client-dashboard";
    return "/auth";
  };

  const items = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Browse", path: "/ecommerce" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: cartCount },
    { icon: User, label: "Account", path: getAccountPath() },
  ];

  return (
    <nav className="fixed !bottom-0 inset-x-0 z-50 bg-background border-t border-border md:hidden pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
