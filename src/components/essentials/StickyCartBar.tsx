import { useEssentialsCart } from "@/stores/essentialsCartStore";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StickyCartBar = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getItemCount } = useEssentialsCart();
  const count = getItemCount();
  const subtotal = getSubtotal();

  if (count === 0) return null;

  return (
    <div
      className="fixed bottom-[60px] md:bottom-0 inset-x-0 z-40 animate-in slide-in-from-bottom-4 duration-300"
      style={{ paddingBottom: "var(--safe-area-bottom, 0px)" }}
    >
      <div className="mx-3 mb-2 md:mx-auto md:max-w-2xl">
        <button
          onClick={() => navigate("/essentials/cart")}
          className="w-full flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-3 shadow-lg shadow-emerald-600/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-emerald-700 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs opacity-90">{count} item{count > 1 ? "s" : ""}</p>
              <p className="text-sm font-bold">{"\u20B9"}{subtotal.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            View Cart
            <ArrowRight className="h-4 w-4" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default StickyCartBar;
