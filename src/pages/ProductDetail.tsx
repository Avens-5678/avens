import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAllRentals } from "@/hooks/useData";
import { useRentalVariants, RentalVariant } from "@/hooks/useRentalVariants";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { isMeasurableUnit } from "@/utils/pricingUtils";
import { ShoppingCart, ArrowLeft, Check, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rentals, isLoading } = useAllRentals();
  const { data: variants } = useRentalVariants(id);
  const { addItem, removeItem, isInCart, getItemCount } = useCart();
  const { toast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<RentalVariant | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const rental = useMemo(() => rentals?.find(r => r.id === id), [rentals, id]);

  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

  const displayImages = useMemo(() => {
    if (selectedVariant) {
      const variantImages = selectedVariant.image_urls?.length
        ? selectedVariant.image_urls
        : selectedVariant.image_url
          ? [selectedVariant.image_url]
          : null;
      if (variantImages) return variantImages;
    }
    if (rental?.image_urls?.length) return rental.image_urls;
    if (rental?.image_url) return [rental.image_url];
    return [];
  }, [rental, selectedVariant]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedVariant]);

  const displayPrice = useMemo(() => {
    if (selectedVariant?.price_value != null) {
      return { value: selectedVariant.price_value, unit: selectedVariant.pricing_unit || "Per Day" };
    }
    if (rental?.price_value != null) {
      return { value: rental.price_value, unit: (rental as any).pricing_unit || "Per Day" };
    }
    if (rental?.price_range) {
      return { text: `₹${rental.price_range}` };
    }
    return null;
  }, [rental, selectedVariant]);

  const variantGroups = useMemo(() => {
    if (!variants?.length) return {};
    const groups: Record<string, RentalVariant[]> = {};
    variants.forEach(v => {
      if (!groups[v.attribute_type]) groups[v.attribute_type] = [];
      groups[v.attribute_type].push(v);
    });
    return groups;
  }, [variants]);

  const variantId = selectedVariant?.id;
  const inCart = isInCart(id!, variantId);

  const handleAddToCart = () => {
    if (!rental) return;
    addItem({
      id: rental.id,
      title: rental.title + (selectedVariant ? ` - ${selectedVariant.attribute_value}` : ""),
      price_value: selectedVariant?.price_value ?? rental.price_value ?? null,
      pricing_unit: selectedVariant?.pricing_unit ?? (rental as any).pricing_unit ?? "Per Day",
      price_range: rental.price_range,
      image_url: displayImages[0] || rental.image_url,
      quantity,
      variant_id: selectedVariant?.id,
      variant_label: selectedVariant?.attribute_value,
    });
    toast({ title: "Added to Cart", description: `${rental.title} added successfully.` });
  };

  if (isLoading) {
    return <Layout><div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div></Layout>;
  }

  if (!rental) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h2>
          <Button onClick={() => navigate("/ecommerce")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Shop</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Top Bar */}
      <section className="pt-4 pb-3 border-b border-border sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/ecommerce")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button onClick={() => navigate("/ecommerce")} className="hover:text-foreground transition-colors">Shop</button>
              <span>/</span>
              <span className="text-foreground font-medium line-clamp-1">{rental.title}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/cart")} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart ({getItemCount()})
          </Button>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
                {displayImages.length > 0 ? (
                  <img src={displayImages[currentImageIndex]} alt={rental.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}
                {displayImages.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIndex(i => (i - 1 + displayImages.length) % displayImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={() => setCurrentImageIndex(i => (i + 1) % displayImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {displayImages.map((img, i) => (
                    <button key={i} onClick={() => setCurrentImageIndex(i)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === currentImageIndex ? "border-primary" : "border-border"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {rental.categories && rental.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {rental.categories.map((cat) => (<Badge key={cat} variant="secondary">{cat}</Badge>))}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">{rental.title}</h1>

              {displayPrice && (
                <div className="flex items-baseline gap-2">
                  {'value' in displayPrice ? (
                    <>
                      <span className="text-3xl font-bold text-primary">₹{displayPrice.value.toLocaleString()}</span>
                      <span className="text-lg text-muted-foreground">/ {displayPrice.unit}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-primary">{displayPrice.text}</span>
                  )}
                </div>
              )}

              {/* Variant Selectors - pill buttons */}
              {Object.entries(variantGroups).map(([attrType, attrVariants]) => (
                <div key={attrType} className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{attrType}</h3>
                  <div className="flex flex-wrap gap-2">
                    {attrVariants.map((v) => (
                      <button key={v.id} onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                          selectedVariant?.id === v.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        {v.attribute_value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity — dynamic based on pricing unit */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  {isMeasurableUnit(displayPrice && 'unit' in displayPrice ? displayPrice.unit : undefined)
                    ? `Measurement (${displayPrice && 'unit' in displayPrice ? displayPrice.unit : ""})`
                    : "Quantity"}
                </h3>
                {isMeasurableUnit(displayPrice && 'unit' in displayPrice ? displayPrice.unit : undefined) ? (
                  <Input
                    type="number"
                    min={1}
                    step="any"
                    value={quantity}
                    onChange={e => setQuantity(parseFloat(e.target.value) || 1)}
                    placeholder="e.g. 500"
                    className="max-w-[200px]"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>+</Button>
                  </div>
                )}
              </div>

              {inCart ? (
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/cart")} size="lg" className="flex-1 text-base">
                    <ShoppingCart className="mr-2 h-5 w-5" />View Cart
                  </Button>
                  <Button
                    onClick={() => { removeItem(id!, variantId); toast({ title: "Removed", description: "Item removed from cart." }); }}
                    size="lg" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button onClick={handleAddToCart} size="lg" className="w-full text-base">
                  <ShoppingCart className="mr-2 h-5 w-5" />Add to Cart
                </Button>
              )}

              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{rental.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;
