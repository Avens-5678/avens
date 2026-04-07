import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Home, Search, ShoppingBag, CalendarDays, User } from "lucide-react";

const tabs = [
  { label: "Home", icon: Home, path: "/ecommerce", match: (p: string) => p === "/ecommerce" },
  { label: "Search", icon: Search, path: "/ecommerce?focus=search", match: (p: string) => false },
  { label: "Cart", icon: ShoppingBag, path: "/cart", match: (p: string) => p === "/cart" },
  { label: "Events", icon: CalendarDays, path: "/ecommerce/orders", match: (p: string) => p.includes("orders") || p.includes("my-event") },
  { label: "Account", icon: User, path: "/client/dashboard", match: (p: string) => p.includes("dashboard") || p.includes("auth") },
] as const;

const MobileTabBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();
  const cartCount = items.length;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 md:hidden"
      style={{ paddingBottom: "var(--safe-area-bottom, 0px)" }}
    >
      <div className="flex items-center h-[60px]">
        {tabs.map(({ label, icon: Icon, path, match }) => {
          const active = match(pathname);
          const isCart = label === "Cart";

          return (
            <button
              key={label}
              onClick={() => {
                if (label === "Search") {
                  navigate("/ecommerce");
                  setTimeout(() => {
                    const el = document.querySelector<HTMLInputElement>("[data-search-input]");
                    el?.focus();
                  }, 100);
                } else {
                  navigate(path);
                }
              }}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 h-full transition-colors ${
                active ? "text-evn-600" : "text-gray-400"
              }`}
            >
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} />
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-evn-600 text-white text-[9px] font-bold px-1">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </span>
              <span className={`text-[10px] leading-none ${active ? "font-bold text-evn-600" : "font-medium"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
