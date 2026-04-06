import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Circle, Sparkles, PartyPopper, Flame, Utensils,
  Package, Camera, Gift, Heart,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "circle-dot": Circle,
  sparkles: Sparkles,
  "party-popper": PartyPopper,
  flame: Flame,
  utensils: Utensils,
  package: Package,
  camera: Camera,
  gift: Gift,
  heart: Heart,
};

interface Props {
  activeCategory: string | null;
  onSelect: (slug: string | null) => void;
}

const CategoryStrip = ({ activeCategory, onSelect }: Props) => {
  const { data: categories } = useQuery({
    queryKey: ["essential-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!categories?.length) return null;

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 py-3 min-w-max">
        {/* All chip */}
        <button
          onClick={() => onSelect(null)}
          className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${
            !activeCategory ? "scale-105" : "opacity-70"
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              !activeCategory
                ? "bg-emerald-100 ring-2 ring-emerald-500"
                : "bg-gray-100"
            }`}
          >
            <Package className="h-6 w-6 text-emerald-600" />
          </div>
          <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">
            All
          </span>
        </button>

        {categories.map((cat) => {
          const Icon = iconMap[cat.icon_name || ""] || Package;
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(isActive ? null : cat.slug)}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${
                isActive ? "scale-105" : "opacity-70"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-emerald-100 ring-2 ring-emerald-500"
                    : "bg-gray-100"
                }`}
              >
                <Icon className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-[10px] font-medium text-gray-700 text-center leading-tight max-w-[64px]">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryStrip;
