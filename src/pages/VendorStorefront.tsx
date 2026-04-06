import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout/Layout";
import { MapPin, ShieldCheck, MessageCircle, Star, Store, Package, Share2 } from "lucide-react";
import { shareContent } from "@/services/shareService";

interface VendorProfile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
}

export default function VendorStorefront() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "reviews" | "about">("listings");

  const isVerified = useMemo(() => listings.some((l) => l.is_verified), [listings]);
  const categories = useMemo(() => {
    const all = listings.flatMap((l) => l.categories || []);
    return [...new Set(all)];
  }, [listings]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  useEffect(() => {
    if (!vendorId) return;
    const load = async () => {
      setLoading(true);

      // Fetch vendor profile
      const { data: vendorData } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, avatar_url, city, bio, phone, created_at")
        .eq("user_id", vendorId)
        .maybeSingle();

      // Fetch vendor's active inventory items
      const { data: listingsData } = await supabase
        .from("vendor_inventory")
        .select("*")
        .eq("vendor_id", vendorId)
        .eq("is_available", true)
        .order("is_verified", { ascending: false })
        .limit(30);

      // Fetch reviews via rental_ids linked to this vendor's inventory
      const itemIds = (listingsData || []).map((l: any) => l.id);
      let reviewsData: any[] = [];
      if (itemIds.length > 0) {
        // rental_reviews is tied to rentals, but vendor_inventory items may have
        // their own IDs used in rental_orders. Try fetching reviews by rental_id.
        const { data } = await supabase
          .from("rental_reviews")
          .select("*")
          .in("rental_id", itemIds)
          .eq("is_approved", true)
          .order("created_at", { ascending: false })
          .limit(20);
        reviewsData = data || [];
      }

      setVendor(vendorData as VendorProfile | null);
      setListings(listingsData || []);
      setReviews(reviewsData);
      setLoading(false);
    };
    load();
  }, [vendorId]);

  // Skeleton loader
  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-40 bg-muted" />
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl -mt-10">
            <div className="flex items-end gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-muted border-4 border-background" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-muted rounded w-48" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!vendor) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <Store className="h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Vendor not found</h2>
          <p className="text-sm text-muted-foreground mt-1">This vendor may have been removed or the link is incorrect.</p>
          <button
            onClick={() => navigate("/ecommerce")}
            className="mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Browse vendors &rarr;
          </button>
        </div>
      </Layout>
    );
  }

  const displayName = vendor.company_name || vendor.full_name || "Vendor";
  const memberSince = new Date(vendor.created_at).getFullYear();

  return (
    <Layout>
      {/* HERO / COVER */}
      <div className="relative">
        <div className="h-36 sm:h-44 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400" />

        {/* Avatar overlapping cover */}
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
          <div className="-mt-10 sm:-mt-12 mb-4 flex items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
              {vendor.avatar_url ? (
                <img src={vendor.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-muted-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{displayName}</h1>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {vendor.city && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {vendor.city}
                  </span>
                )}
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <ShieldCheck className="h-3.5 w-3.5" /> Evnting Assured
                  </span>
                )}
              </div>
            </div>
            {/* Message button */}
            <button
              onClick={() => {
                if (vendor.phone) {
                  window.open(`https://wa.me/91${vendor.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I found you on Evnting!")}`, "_blank");
                } else {
                  navigate("/ecommerce");
                }
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
            >
              <MessageCircle className="h-4 w-4" /> Message
            </button>
            <button
              onClick={() => shareContent({ title: `${displayName} on Evnting`, text: `Check out ${displayName} on Evnting`, url: `https://evnting.com/vendor/${vendorId}` })}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl border border-border hover:bg-muted transition-colors flex-shrink-0"
              title="Share"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Listings", value: listings.length },
            { label: "Reviews", value: reviews.length },
            { label: "Avg rating", value: avgRating ? `${avgRating} \u2605` : "New" },
            { label: "Since", value: memberSince },
          ].map((stat) => (
            <div key={stat.label} className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mobile message button */}
        <button
          onClick={() => {
            if (vendor.phone) {
              window.open(`https://wa.me/91${vendor.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I found you on Evnting!")}`, "_blank");
            }
          }}
          className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors mb-6"
        >
          <MessageCircle className="h-4 w-4" /> Message vendor
        </button>

        {/* TABS */}
        <div className="flex border-b border-border mb-6">
          {(["listings", "reviews", "about"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {tab === "listings" && ` (${listings.length})`}
              {tab === "reviews" && reviews.length > 0 && ` (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* LISTINGS TAB */}
        {activeTab === "listings" && (
          <div className="pb-10">
            {listings.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No active listings yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => navigate(`/ecommerce/${listing.id}`)}
                    className="border border-border/60 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-card group"
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      {listing.image_urls?.[0] || listing.image_url ? (
                        <img
                          src={listing.image_urls?.[0] || listing.image_url}
                          alt={listing.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {listing.name}
                      </h4>
                      {listing.categories?.[0] && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{listing.categories[0]}</p>
                      )}
                      {listing.price_value != null && (
                        <div className="mt-1.5">
                          <span className="text-sm font-bold text-foreground">
                            {"\u20B9"}{listing.price_value.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1">/ {listing.pricing_unit || "day"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="pb-10">
            {reviews.length === 0 ? (
              <div className="text-center py-16">
                <Star className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">No reviews yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to book and leave a review</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Rating summary */}
                <div className="bg-muted/50 rounded-xl p-5 flex items-center gap-4">
                  <div>
                    <div className="text-3xl font-bold text-foreground">{avgRating}</div>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Individual reviews */}
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-border/40 pb-5 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                        {(review.reviewer_name || "A").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {review.reviewer_name || "Verified Customer"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex gap-0.5 ml-auto flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <div className="pb-10 space-y-6">
            {vendor.bio && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{vendor.bio}</p>
              </div>
            )}
            {categories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span key={cat} className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-foreground">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {vendor.phone && (
              <a
                href={`https://wa.me/91${vendor.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I found you on Evnting!")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            )}
            {!vendor.bio && categories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No additional details available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
