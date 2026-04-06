import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useEssentialsCart } from "@/stores/essentialsCartStore";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  compare_price?: number | null;
  images: string[];
  stock_count: number;
  min_order_qty: number;
  max_order_qty: number;
  weight_grams?: number | null;
  vendor_id: string;
  low_stock_threshold: number;
  is_active: boolean;
}

interface Props {
  product: Product;
}

const EssentialProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity, removeItem } = useEssentialsCart();
  const cartItem = items.find((i) => i.product_id === product.id);
  const qty = cartItem?.quantity || 0;

  const outOfStock = product.stock_count <= 0;
  const lowStock =
    !outOfStock && product.stock_count <= product.low_stock_threshold;

  const discount =
    product.compare_price && product.compare_price > product.price
      ? Math.round(
          ((product.compare_price - product.price) / product.compare_price) *
            100
        )
      : 0;

  const imageUrl = product.images?.[0] || "/placeholder.svg";

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      compare_price: product.compare_price ?? undefined,
      image_url: imageUrl,
      max_qty: product.max_order_qty,
      stock_count: product.stock_count,
      vendor_id: product.vendor_id,
    });
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qty <= 1) removeItem(product.id);
    else updateQuantity(product.id, qty - 1);
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, qty + 1);
  };

  return (
    <div
      onClick={() => navigate(`/essentials/product/${product.id}`)}
      className={`relative bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${
        outOfStock ? "opacity-60" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 p-2">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        {/* Discount badge */}
        {discount > 0 && !outOfStock && (
          <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {discount}% OFF
          </span>
        )}
        {/* Out of stock */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {/* Low stock */}
        {lowStock && (
          <span className="absolute bottom-1.5 left-1.5 text-amber-600 text-[10px] font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
            Only {product.stock_count} left
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 pt-2">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight min-h-[2.5rem]">
          {product.name}
        </h3>
        {product.weight_grams && (
          <p className="text-[11px] text-gray-400 mt-0.5">
            {product.weight_grams >= 1000
              ? `${(product.weight_grams / 1000).toFixed(1)} kg`
              : `${product.weight_grams} g`}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900">
              {"\u20B9"}{product.price}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {"\u20B9"}{product.compare_price}
              </span>
            )}
          </div>

          {/* Add / Qty controls */}
          {!outOfStock &&
            (qty === 0 ? (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                ADD
                <Plus className="h-3 w-3" />
              </button>
            ) : (
              <div className="flex items-center gap-0 bg-emerald-600 rounded-lg overflow-hidden">
                <button
                  onClick={handleMinus}
                  className="px-2 py-1.5 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-2 py-1 text-white text-xs font-bold min-w-[1.5rem] text-center">
                  {qty}
                </span>
                <button
                  onClick={handlePlus}
                  className="px-2 py-1.5 text-white hover:bg-emerald-700 transition-colors"
                  disabled={
                    qty >= product.max_order_qty || qty >= product.stock_count
                  }
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EssentialProductCard;
