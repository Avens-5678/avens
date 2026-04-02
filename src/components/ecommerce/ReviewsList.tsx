import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, BadgeCheck, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ReviewsListProps {
  rentalId: string;
}

const StarRow = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const h = size === "md" ? "h-4 w-4" : "h-3 w-3";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${h} transition-colors ${
            s <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
};

const maskName = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

const ReviewsList = ({ rentalId }: ReviewsListProps) => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["rental-reviews", rentalId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("rental_reviews" as any) as any)
        .select("*")
        .eq("rental_id", rentalId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  // --- Summary stats ---
  const total = reviews.length;
  const avg =
    total > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / total
      : 0;

  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r: any) => {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++;
  });

  if (total === 0) {
    return (
      <div className="text-center py-10 space-y-3">
        <Star className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">
          No reviews yet — be the first to review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/40 rounded-xl">
        {/* Average score */}
        <div className="flex flex-col items-center justify-center gap-1 min-w-[80px]">
          <span className="text-4xl font-bold text-foreground">{avg.toFixed(1)}</span>
          <StarRow rating={Math.round(avg)} size="md" />
          <span className="text-xs text-muted-foreground">{total} review{total !== 1 ? "s" : ""}</span>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = dist[star];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-right text-muted-foreground font-medium">{star}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {reviews.map((review: any) => (
          <div
            key={review.id}
            className="border border-border rounded-xl p-4 space-y-3 bg-card"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {maskName(review.reviewer_name)}
                  </span>
                  {review.verified_booking && (
                    <Badge
                      variant="secondary"
                      className="text-[9px] py-0 px-1.5 h-4 gap-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                    >
                      <BadgeCheck className="h-2.5 w-2.5" /> Verified Booking
                    </Badge>
                  )}
                </div>
                <StarRow rating={review.rating} />
              </div>
              <span className="text-[11px] text-muted-foreground flex-shrink-0">
                {format(new Date(review.created_at), "d MMM yyyy")}
              </span>
            </div>

            {/* Review text */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.review_text}
            </p>

            {/* Photos */}
            {review.photo_urls?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {review.photo_urls.map((url: string, i: number) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-md overflow-hidden border border-border bg-muted flex-shrink-0"
                  >
                    <img
                      src={url}
                      alt={`Review photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
