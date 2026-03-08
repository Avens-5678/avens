import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import EcommerceHeader from "@/components/ecommerce/EcommerceHeader";
import QuickCartSheet from "@/components/ecommerce/QuickCartSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAllRentals } from "@/hooks/useData";
import { useRentalVariants, RentalVariant } from "@/hooks/useRentalVariants";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { isMeasurableUnit } from "@/utils/pricingUtils";
import {
  ShoppingCart, ArrowLeft, Trash2, ChevronLeft, ChevronRight,
  Star, ShieldCheck, Truck, Headphones, Share2,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Recently viewed helper
const RECENT_KEY = "evnting_recently_viewed";
const addToRecentlyViewed = (id: string) => {
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const updated = [id, ...existing.filter((x) => x !== id)].slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
};

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
  const [length, setLength] = useState<number>(0);
  const [breadth, setBreadth] = useState<number>(0);
  const [quickCartOpen, setQuickCartOpen] = useState(false);

  // Header search state (minimal for PDP context)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCat, setSearchCat] = useState("");

  const rental = useMemo(() => rentals?.find((r) => r.id === id), [rentals, id]);

  // Track recently viewed
  useEffect(() => {
    if (id) addToRecentlyViewed(id);
  }, [id]);

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

  const currentUnit = displayPrice && "unit" in displayPrice ? displayPrice.unit : undefined;
  const isMeasurable = isMeasurableUnit(currentUnit);

  const variantGroups = useMemo(() => {
    if (!variants?.length) return {};
    const groups: Record<string, RentalVariant[]> = {};
    variants.forEach((v) => {
      if (!groups[v.attribute_type]) groups[v.attribute_type] = [];
      groups[v.attribute_type].push(v);
    });
    return groups;
  }, [variants]);

  const variantId = selectedVariant?.id;
  const inCart = isInCart(id!, variantId);
  const computedArea = isMeasurable ? (length || 0) * (breadth || 0) : quantity;

  const allCategories = useMemo(() => {
    if (!rentals) return [];
    const cats = new Set<string>();
    rentals.forEach((r) => r.categories?.forEach((c: string) => cats.add(c)));
    return Array.from(cats).sort();
  }, [rentals]);

  // "You May Also Like" — same category products
  const suggestions = useMemo(() => {
    if (!rentals || !rental) return [];
    const cats = rental.categories || [];
    const sameCat = rentals.filter(
      (r) => r.id !== id && r.is_active !== false && r.categories?.some((c: string) => cats.includes(c))
    );
    const pool = sameCat.length >= 4 ? sameCat : rentals.filter((r) => r.id !== id && r.is_active !== false);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
  }, [rentals, rental, id]);

  const handleAddToCart = () => {
    if (!rental) return;
    const finalQuantity = isMeasurable ? computedArea : quantity;
    if (isMeasurable && finalQuantity <= 0) {
      toast({ title: "Enter dimensions", description: "Please enter valid Length and Breadth.", variant: "destructive" });
      return;
    }
    addItem({
      id: rental.id,
      title: rental.title + (selectedVariant ? ` - ${selectedVariant.attribute_value}` : ""),
      price_value: selectedVariant?.price_value ?? rental.price_value ?? null,
      pricing_unit: selectedVariant?.pricing_unit ?? (rental as any).pricing_unit ?? "Per Day",
      price_range: rental.price_range,
      image_url: displayImages[0] || rental.image_url,
      quantity: finalQuantity,
      variant_id: selectedVariant?.id,
      variant_label: selectedVariant?.attribute_value,
      length: isMeasurable ? length : undefined,
      breadth: isMeasurable ? breadth : undefined,
    });
    toast({ title: "Added to Cart", description: `${rental.title} added successfully.` });
    setQuickCartOpen(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: rental?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  if (isLoading) {
    return <Layout hideNavbar><div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div></Layout>;
  }

  if (!rental) {
    return (
      <Layout hideNavbar>
        <EcommerceHeader searchTerm="" onSearchChange={() => {}} categories={[]} selectedSearchCategory="" onSearchCategoryChange={() => {}} />
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h2>
          <Button onClick={() => navigate("/ecommerce")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Shop</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar>
      <EcommerceHeader
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          if (v) navigate(`/ecommerce?search=${encodeURIComponent(v)}`);
        }}
        categories={allCategories}
        selectedSearchCategory={searchCat}
        onSearchCategoryChange={setSearchCat}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/40 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button onClick={() => navigate("/ecommerce")} className="hover:text-foreground transition-colors">Shop</button>
            <span>/</span>
            {rental.categories?.[0] && (
              <>
                <button onClick={() => navigate(`/ecommerce?category=${rental.categories[0]}`)} className="hover:text-foreground transition-colors">
                  {rental.categories[0]}
                </button>
                <span>/</span>
              </>
            )}
            <span className="text-foreground font-medium line-clamp-1">{rental.title}</span>
          </div>
        </div>
      </div>

      {/* Main product section */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                {displayImages.length > 0 ? (
                  <img src={displayImages[currentImageIndex]} alt={rental.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}
                {displayImages.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIndex((i) => (i - 1 + displayImages.length) % displayImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-sm">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={() => setCurrentImageIndex((i) => (i + 1) % displayImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-sm">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                {/* Image counter */}
                {displayImages.length > 1 && (
                  <span className="absolute bottom-3 right-3 bg-foreground/70 text-primary-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {currentImageIndex + 1}/{displayImages.length}
                  </span>
                )}
              </div>
              {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {displayImages.map((img, i) => (
                    <button key={i} onClick={() => setCurrentImageIndex(i)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === currentImageIndex ? "border-primary" : "border-border hover:border-primary/40"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-5">
              {/* Categories */}
              {rental.categories && rental.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {rental.categories.map((cat: string) => (
                    <Badge key={cat} variant="secondary" className="text-[11px]">{cat}</Badge>
                  ))}
                </div>
              )}

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">{rental.title}</h1>

              {/* Rating + Share */}
              <div className="flex items-center gap-4">
                {rental.rating && (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                      {rental.rating} <Star className="h-3 w-3 fill-current" />
                    </span>
                    <span className="text-xs text-muted-foreground">Rating</span>
                  </div>
                )}
                <button onClick={handleShare} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>

              {/* Price */}
              {displayPrice && (
                <div className="flex items-baseline gap-2 pt-1">
                  {"value" in displayPrice ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-bold text-primary">₹{displayPrice.value.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">/ {displayPrice.unit}</span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-primary">{displayPrice.text}</span>
                  )}
                </div>
              )}

              {/* Assured badge */}
              {rental.rating && rental.rating >= 4 && (
                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">Evnting Assured</span>
                </div>
              )}

              {/* Variant Selectors */}
              {Object.entries(variantGroups).map(([attrType, attrVariants]) => (
                <div key={attrType} className="space-y-2.5">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">{attrType}</h3>
                  <div className="flex flex-wrap gap-2">
                    {attrVariants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
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

              {/* Quantity / Dimensions */}
              <div className="space-y-2.5">
                {isMeasurable ? (
                  <>
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Dimensions ({currentUnit})</h3>
                    <div className="grid grid-cols-2 gap-3 max-w-[280px]">
                      <div className="space-y-1">
                        <Label htmlFor="pdp-length" className="text-[11px] text-muted-foreground">Length</Label>
                        <Input id="pdp-length" type="number" min={0} step="any" value={length || ""} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} placeholder="e.g. 50" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="pdp-breadth" className="text-[11px] text-muted-foreground">Breadth</Label>
                        <Input id="pdp-breadth" type="number" min={0} step="any" value={breadth || ""} onChange={(e) => setBreadth(parseFloat(e.target.value) || 0)} placeholder="e.g. 30" />
                      </div>
                    </div>
                    {length > 0 && breadth > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Total Area: <span className="font-semibold text-foreground">{computedArea.toLocaleString()} {currentUnit?.replace("Per ", "")}</span>
                        {displayPrice && "value" in displayPrice && (
                          <> — Est: <span className="font-semibold text-primary">₹{(computedArea * displayPrice.value).toLocaleString()}</span></>
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Quantity</h3>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</Button>
                      <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity((q) => q + 1)}>+</Button>
                    </div>
                  </>
                )}
              </div>

              {/* CTA */}
              {inCart ? (
                <div className="flex gap-3">
                  <Button onClick={() => setQuickCartOpen(true)} size="lg" className="flex-1 text-base gap-2">
                    <ShoppingCart className="h-5 w-5" />View Cart
                  </Button>
                  <Button
                    onClick={() => { removeItem(id!, variantId); toast({ title: "Removed", description: "Item removed from cart." }); }}
                    size="lg" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button onClick={handleAddToCart} size="lg" className="w-full text-base gap-2">
                  <ShoppingCart className="h-5 w-5" />Add to Cart
                </Button>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: ShieldCheck, label: "Assured Quality" },
                  { icon: Truck, label: "Free Delivery" },
                  { icon: Headphones, label: "24/7 Support" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 py-3 rounded-lg border border-border bg-muted/30 text-center">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="space-y-2 pt-3 border-t border-border">
                <h3 className="text-base font-semibold text-foreground">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{rental.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* You May Also Like */}
      {suggestions.length > 0 && (
        <section className="py-8 border-t border-border bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-lg font-bold text-foreground mb-5">You May Also Like</h2>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {suggestions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/ecommerce/${r.id}`)}
                  className="flex-shrink-0 w-40 sm:w-48 text-left group"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted border border-border mb-2">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{r.title}</p>
                  {r.price_value != null && (
                    <p className="text-sm font-bold text-foreground mt-1">₹{r.price_value.toLocaleString()}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Cart Sheet */}
      <QuickCartSheet
        open={quickCartOpen}
        onOpenChange={setQuickCartOpen}
        allRentals={rentals || []}
        currentCategories={rental.categories || []}
        currentProductId={id}
      />
    </Layout>
  );
};

export default ProductDetail;
