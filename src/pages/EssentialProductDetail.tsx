import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEssentialsCart } from "@/stores/essentialsCartStore";
import Layout from "@/components/Layout/Layout";
import EssentialProductCard from "@/components/essentials/EssentialProductCard";
import StickyCartBar from "@/components/essentials/StickyCartBar";
import {
  ArrowLeft, Plus, Minus, Star, ShoppingBag, AlertTriangle,
} from "lucide-react";

const EssentialProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, addItem, updateQuantity, removeItem } = useEssentialsCart();
  const [activeImg, setActiveImg] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["essential-product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_products")
        .select("*, essential_categories(name, slug)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Related products
  const { data: related } = useQuery({
    queryKey: ["essential-related", product?.category_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essential_products")
        .select("*, essential_categories(slug, name)")
        .eq("category_id", product!.category_id!)
        .eq("is_active", true)
        .neq("id", id!)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400">Product not found</p>
        </div>
      </Layout>
    );
  }

  const cartItem = items.find((i) => i.product_id === product.id);
  const qty = cartItem?.quantity || 0;
  const images = product.images?.length ? product.images : ["/placeholder.svg"];
  const outOfStock = product.stock_count <= 0;
  const lowStock = !outOfStock && product.stock_count <= product.low_stock_threshold;
  const discount =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      compare_price: product.compare_price ?? undefined,
      image_url: images[0],
      max_qty: product.max_order_qty,
      stock_count: product.stock_count,
      vendor_id: product.vendor_id,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Back button */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="container mx-auto px-4 py-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Image gallery */}
        <div className="bg-white">
          <div className="aspect-square relative overflow-hidden">
            <img
              src={images[activeImg]}
              alt={product.name}
              className="w-full h-full object-contain p-6"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                {discount}% OFF
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-14 h-14 rounded-lg border-2 flex-shrink-0 overflow-hidden ${
                    activeImg === i ? "border-emerald-500" : "border-gray-200"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 mt-4 space-y-4 max-w-2xl">
          {/* Product info */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            {product.essential_categories && (
              <p className="text-xs text-emerald-600 font-semibold mb-1">
                {(product.essential_categories as any).name}
              </p>
            )}
            <h1 className="text-lg font-bold text-gray-900">{product.name}</h1>

            {product.weight_grams && (
              <p className="text-xs text-gray-400 mt-0.5">
                {product.weight_grams >= 1000
                  ? `${(product.weight_grams / 1000).toFixed(1)} kg`
                  : `${product.weight_grams} g`}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xl font-bold text-gray-900">
                {"\u20B9"}{product.price}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  {"\u20B9"}{product.compare_price}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Save {"\u20B9"}{(product.compare_price - product.price).toFixed(0)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="mt-3">
              {outOfStock && (
                <div className="flex items-center gap-1.5 text-red-500 text-sm">
                  <AlertTriangle className="h-4 w-4" /> Out of Stock
                </div>
              )}
              {lowStock && (
                <p className="text-amber-600 text-sm font-medium">
                  Only {product.stock_count} left — hurry!
                </p>
              )}
              {!outOfStock && !lowStock && (
                <p className="text-emerald-600 text-sm font-medium">In Stock</p>
              )}
            </div>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded">
                  <Star className="h-3 w-3 text-emerald-600 fill-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">
                    {product.avg_rating?.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  ({product.review_count} review{product.review_count > 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Related products */}
          {related && related.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Related Products
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {related.slice(0, 4).map((p: any) => (
                  <EssentialProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed add-to-cart bar */}
        {!outOfStock && (
          <div
            className="fixed bottom-[60px] md:bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 px-4 py-3"
            style={{ paddingBottom: "var(--safe-area-bottom, 0px)" }}
          >
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <div>
                <p className="text-lg font-bold text-gray-900">{"\u20B9"}{product.price}</p>
              </div>
              <div className="flex-1">
                {qty === 0 ? (
                  <button
                    onClick={handleAdd}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-0 bg-emerald-600 rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        qty <= 1
                          ? removeItem(product.id)
                          : updateQuantity(product.id, qty - 1)
                      }
                      className="px-5 py-3 text-white hover:bg-emerald-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-white font-bold">{qty}</span>
                    <button
                      onClick={() => updateQuantity(product.id, qty + 1)}
                      disabled={qty >= product.max_order_qty || qty >= product.stock_count}
                      className="px-5 py-3 text-white hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sticky cart bar (shows on other products added) */}
        {qty === 0 && <StickyCartBar />}
      </div>
    </Layout>
  );
};

export default EssentialProductDetail;
