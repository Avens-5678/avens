import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAllRentals } from "@/hooks/useData";
import { Loader2, Search, ShoppingBag, IndianRupee, Star } from "lucide-react";

const Marketplace = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = rentals 
    ? [...new Set(rentals.flatMap(r => r.categories || []))]
    : [];

  // Filter rentals
  const filteredRentals = rentals?.filter((rental) => {
    const matchesSearch = rental.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || rental.categories?.includes(selectedCategory);
    return matchesSearch && matchesCategory && rental.is_active;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Evnting Marketplace</h2>
          <p className="text-muted-foreground text-sm">
            Browse our rental catalog for cross-rental opportunities
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      )}

      {!filteredRentals || filteredRentals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No rental items available at the moment"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRentals.map((rental) => (
            <Card key={rental.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {rental.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={rental.image_url}
                    alt={rental.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-1">{rental.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {rental.short_description}
                </p>
                
                <div className="flex items-center justify-between">
                  {rental.price_range && (
                    <span className="flex items-center text-sm font-medium">
                      <IndianRupee className="h-3 w-3" />
                      {rental.price_range}
                    </span>
                  )}
                  {rental.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span>{rental.rating}</span>
                    </div>
                  )}
                </div>

                {rental.categories && rental.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rental.categories.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
