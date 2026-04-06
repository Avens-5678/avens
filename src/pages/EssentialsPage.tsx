import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout/Layout";
import CategoryStrip from "@/components/essentials/CategoryStrip";
import EssentialProductCard from "@/components/essentials/EssentialProductCard";
import StickyCartBar from "@/components/essentials/StickyCartBar";
import { Search, MapPin, Clock, Zap, ChevronRight, PartyPopper, Sparkles } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";

const EssentialsPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { location } = useUserLocation();

  // Fetch all categories
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

  // Fetch all active products
  const { data: products, isLoading } = useQuery({
    queryKey: ["essential-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_products")
        .select("*, essential_categories(slug, name)")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("total_sold", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // Filter products
  const filtered = useMemo(() => {
    if (!products) return [];
    let result = products;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (activeCategory) {
      result = result.filter(
        (p: any) => p.essential_categories?.slug === activeCategory
      );
    }

    return result;
  }, [products, search, activeCategory]);

  // Group products by category for browse-all view
  const groupedByCategory = useMemo(() => {
    if (activeCategory || search.trim()) return null;
    if (!products || !categories) return null;

    return categories
      .map((cat) => ({
        ...cat,
        products: products.filter(
          (p: any) => p.essential_categories?.slug === cat.slug
        ),
      }))
      .filter((g) => g.products.length > 0);
  }, [products, categories, activeCategory, search]);

  const displayAddress = location?.cityName || location?.pinCode || "Set delivery location";

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar: location + delivery time */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
            <button className="flex items-center gap-1.5 text-sm min-w-0">
              <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-500 flex-shrink-0 hidden sm:inline">Delivering to:</span>
              <span className="font-semibold text-gray-900 truncate max-w-[140px] sm:max-w-none">
                {displayAddress}
              </span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Zap className="h-3 w-3" />
              <span className="font-semibold">Express ~45 min</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-32">
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for balloons, decorations, candles..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Category strip */}
          <CategoryStrip
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {/* Banner */}
          <div className="grid grid-cols-2 gap-3 mt-2 mb-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-4 text-white">
              <PartyPopper className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-[11px] font-medium opacity-90">Theme Kits</p>
              <p className="text-lg font-bold leading-tight">
                Starting {"\u20B9"}999
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 text-white">
              <Sparkles className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-[11px] font-medium opacity-90">Free Delivery</p>
              <p className="text-lg font-bold leading-tight">
                Above {"\u20B9"}499
              </p>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-t-xl" />
                  <div className="p-2.5 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filtered view (search or category selected) */}
          {(activeCategory || search.trim()) && !isLoading && (
            <>
              <h2 className="text-base font-bold text-gray-900 mt-2 mb-3">
                {activeCategory
                  ? categories?.find((c) => c.slug === activeCategory)?.name || "Products"
                  : `Results for "${search}"`}
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({filtered.length})
                </span>
              </h2>
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filtered.map((p: any) => (
                    <EssentialProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Browse-all: grouped by category */}
          {groupedByCategory && !isLoading && (
            <div className="space-y-6 mt-2">
              {groupedByCategory.map((group) => (
                <section key={group.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-gray-900">
                      {group.name}
                    </h2>
                    <button
                      onClick={() => setActiveCategory(group.slug)}
                      className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      View All
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {group.products.slice(0, 4).map((p: any) => (
                      <EssentialProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Empty state when no products at all */}
          {!isLoading && products?.length === 0 && (
            <div className="text-center py-16">
              <PartyPopper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">
                Coming Soon!
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Party supplies will be available here shortly
              </p>
            </div>
          )}
        </div>

        {/* Sticky cart bar */}
        <StickyCartBar />
      </div>
    </Layout>
  );
};

export default EssentialsPage;
