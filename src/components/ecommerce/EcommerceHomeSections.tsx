import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MultiImageCarousel } from "@/components/ui/multi-image-carousel";
import {
  Search,
  ShoppingCart,
  Star,
  ArrowRight,
  Tent,
  Lightbulb,
  Speaker,
  Armchair,
  Snowflake,
  Clapperboard,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface EcommerceHomeSectionsProps {
  rentals: any[];
  categories: string[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onCategoryClick: (cat: string) => void;
}

// Map category names to icons
const CATEGORY_ICONS: Record<string, any> = {
  Structures: Tent,
  Lighting: Lightbulb,
  Sound: Speaker,
  Furniture: Armchair,
  "AC & Cooling": Snowflake,
  Stage: Clapperboard,
};

const getIconForCategory = (cat: string) => {
  const key = Object.keys(CATEGORY_ICONS).find((k) =>
    cat.toLowerCase().includes(k.toLowerCase())
  );
  return key ? CATEGORY_ICONS[key] : ShoppingCart;
};

const EcommerceHomeSections = ({
  rentals,
  categories,
  searchTerm,
  onSearchChange,
  onCategoryClick,
}: EcommerceHomeSectionsProps) => {
  const navigate = useNavigate();

  const featuredProducts = useMemo(() => {
    if (!rentals) return [];
    return rentals
      .filter((r) => r.show_on_home && r.is_active !== false)
      .slice(0, 8);
  }, [rentals]);

  const topRated = useMemo(() => {
    if (!rentals) return [];
    return [...rentals]
      .filter((r) => r.rating && r.rating > 0 && r.is_active !== false)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 8);
  }, [rentals]);

  const newArrivals = useMemo(() => {
    if (!rentals) return [];
    return [...rentals]
      .filter((r) => r.is_active !== false)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [rentals]);

  const scrollToShop = () => {
    document.getElementById("shop-catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background">
      {/* ── Hero Banner ── */}
      <section className="relative w-full h-[340px] sm:h-[400px] lg:h-[460px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/event-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <Badge
            variant="secondary"
            className="mb-4 rounded-full px-5 py-1.5 bg-white/10 backdrop-blur-sm border-white/20 text-white text-xs"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Premium Equipment Rentals
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 max-w-3xl leading-tight">
            Everything You Need for{" "}
            <span className="text-secondary">Extraordinary</span> Events
          </h1>
          <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-xl mb-6">
            Structures, lighting, sound systems, furniture & more — delivered to your venue.
          </p>
          {/* Search Bar */}
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search equipment, furniture, or services..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-14 text-base rounded-full bg-background/95 backdrop-blur-sm border-0 shadow-2xl"
            />
          </div>
          <div className="flex gap-3 mt-5">
            <Button
              onClick={scrollToShop}
              size="lg"
              className="rounded-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
            >
              Shop All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Browse by Category ── */}
      {categories.length > 0 && (
        <section className="py-10 sm:py-14 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Browse by Category
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Find the perfect equipment for your event
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat) => {
                const Icon = getIconForCategory(cat);
                const count = rentals.filter(
                  (r) =>
                    r.categories?.some(
                      (c: string) => c.toLowerCase() === cat.toLowerCase()
                    )
                ).length;
                return (
                  <Card
                    key={cat}
                    className="group cursor-pointer border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    onClick={() => onCategoryClick(cat)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-5 sm:p-6 text-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                          {cat}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {count} item{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <ProductRow
          title="Featured Products"
          subtitle="Handpicked by our team for your next event"
          icon={<Sparkles className="h-5 w-5 text-secondary" />}
          products={featuredProducts}
          onViewAll={scrollToShop}
        />
      )}

      {/* ── Top Rated ── */}
      {topRated.length > 0 && (
        <ProductRow
          title="Top Rated"
          subtitle="Highest rated by our customers"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          products={topRated}
          onViewAll={scrollToShop}
          bgClass="bg-muted/30"
        />
      )}

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <ProductRow
          title="New Arrivals"
          subtitle="Recently added to our collection"
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
          products={newArrivals}
          onViewAll={scrollToShop}
        />
      )}
    </div>
  );
};

/* ── Horizontal Product Row ── */
const ProductRow = ({
  title,
  subtitle,
  icon,
  products,
  onViewAll,
  bgClass = "",
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  products: any[];
  onViewAll: () => void;
  bgClass?: string;
}) => {
  const navigate = useNavigate();

  return (
    <section className={`py-10 sm:py-12 ${bgClass}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="text-primary text-sm gap-1 hidden sm:flex"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {products.map((rental) => {
              const images =
                rental.image_urls && rental.image_urls.length > 0
                  ? rental.image_urls
                  : rental.image_url
                  ? [rental.image_url]
                  : [];

              return (
                <Card
                  key={rental.id}
                  className="flex-shrink-0 w-[220px] sm:w-[240px] group cursor-pointer border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
                  onClick={() => navigate(`/ecommerce/${rental.id}`)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <MultiImageCarousel
                      images={images}
                      autoPlay
                      interval={4000}
                    />
                    {rental.rating && rental.rating >= 4 && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-primary/90 text-primary-foreground text-[10px] gap-1 px-1.5 py-0.5">
                          <ShieldCheck className="h-3 w-3" /> Assured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                      {rental.title}
                    </h3>
                    {rental.rating && rental.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-foreground">
                          {rental.rating}
                        </span>
                      </div>
                    )}
                    {rental.price_value != null ? (
                      <div className="mt-2">
                        <span className="text-base font-bold text-foreground">
                          ₹{rental.price_value.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          / {rental.pricing_unit || "Per Day"}
                        </span>
                      </div>
                    ) : rental.price_range ? (
                      <div className="mt-2">
                        <span className="text-sm font-semibold text-foreground">
                          ₹{rental.price_range}
                        </span>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Mobile View All */}
        <div className="flex justify-center mt-4 sm:hidden">
          <Button variant="outline" onClick={onViewAll} className="gap-1">
            View All {title} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EcommerceHomeSections;
