import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BadgeCheck, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`h-3 w-3 ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
      />
    ))}
  </div>
);

const maskName = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

const VendorReviews = () => {
  const { user } = useAuth();

  // Fetch vendor's inventory item IDs
  const { data: itemIds = [], isLoading: idsLoading } = useQuery({
    queryKey: ["vendor-inventory-ids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase.from("vendor_inventory" as any) as any)
        .select("id")
        .eq("vendor_id", user!.id);
      return (data || []).map((r: any) => r.id) as string[];
    },
  });

  // Fetch approved reviews for these items
  const { data: approved = [], isLoading: approvedLoading } = useQuery({
    queryKey: ["vendor-reviews-approved", itemIds],
    enabled: itemIds.length > 0,
    queryFn: async () => {
      const { data } = await (supabase.from("rental_reviews" as any) as any)
        .select("*")
        .in("rental_id", itemIds)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  // Fetch pending reviews for these items
  const { data: pending = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["vendor-reviews-pending", itemIds],
    enabled: itemIds.length > 0,
    queryFn: async () => {
      const { data } = await (supabase.from("rental_reviews" as any) as any)
        .select("*")
        .in("rental_id", itemIds)
        .eq("is_approved", false)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const isLoading = idsLoading || approvedLoading || pendingLoading;

  // Stats
  const total = approved.length;
  const avg =
    total > 0
      ? approved.reduce((sum: number, r: any) => sum + r.rating, 0) / total
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-12 justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading reviews...
      </div>
    );
  }

  if (itemIds.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        Add inventory items to start receiving reviews.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">My Reviews</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{total > 0 ? avg.toFixed(1) : "—"}</p>
              <p className="text-xs text-muted-foreground">Avg. rating</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Approved reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending approval</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending notice */}
      {pending.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
          <Clock className="h-4 w-4 flex-shrink-0" />
          {pending.length} review{pending.length !== 1 ? "s" : ""} pending admin approval.
        </div>
      )}

      {/* Approved reviews */}
      {total === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          No approved reviews yet. Keep delivering great service!
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Reviews</h3>
          {approved.map((r: any) => (
            <Card key={r.id} className="rounded-xl">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {maskName(r.reviewer_name)}
                      </span>
                      {r.verified_booking && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] py-0 px-1.5 h-4 gap-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                        >
                          <BadgeCheck className="h-2.5 w-2.5" /> Verified
                        </Badge>
                      )}
                    </div>
                    <StarRow rating={r.rating} />
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    {format(new Date(r.created_at), "d MMM yyyy")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{r.review_text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorReviews;
