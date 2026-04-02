import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Check, Trash2, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

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

const ReviewCard = ({
  review,
  onApprove,
  onDelete,
  actionLoading,
}: {
  review: any;
  onApprove?: () => void;
  onDelete: () => void;
  actionLoading: boolean;
}) => (
  <Card className="rounded-xl">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{review.reviewer_name}</span>
            {review.reviewer_email && (
              <span className="text-xs text-muted-foreground">{review.reviewer_email}</span>
            )}
            {review.verified_booking && (
              <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                ✓ Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StarRow rating={review.rating} />
            <span className="text-[11px] text-muted-foreground">
              {format(new Date(review.created_at), "d MMM yyyy")}
            </span>
          </div>
          {review.rental_id && (
            <p className="text-[10px] text-muted-foreground font-mono">
              Item: {review.rental_id.slice(0, 8)}…
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {onApprove && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={onApprove}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={onDelete}
            disabled={actionLoading}
          >
            {actionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            {onApprove ? "Reject" : "Remove"}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{review.review_text}</p>

      {review.photo_urls?.length > 0 && (
        <div className="flex gap-2">
          {review.photo_urls.map((url: string, i: number) => (
            <div key={i} className="w-14 h-14 rounded-md overflow-hidden border border-border">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const AdminReviewsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: pending = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["admin-reviews-pending"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("rental_reviews" as any) as any)
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: approved = [], isLoading: approvedLoading } = useQuery({
    queryKey: ["admin-reviews-approved"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("rental_reviews" as any) as any)
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-reviews-pending"] });
    queryClient.invalidateQueries({ queryKey: ["admin-reviews-approved"] });
    // Also invalidate product-level review queries
    queryClient.invalidateQueries({ queryKey: ["rental-reviews"] });
  };

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const { error } = await (supabase.from("rental_reviews" as any) as any)
      .update({ is_approved: true })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Approved", description: "Review is now live." });
      invalidate();
    }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    const { error } = await (supabase.from("rental_reviews" as any) as any)
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Review removed." });
      invalidate();
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold text-foreground">Rental Reviews</h2>
          <p className="text-xs text-muted-foreground">
            {pending.length} pending · {approved.length} approved
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg gap-1.5">
            Pending
            {pending.length > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] ml-0.5">{pending.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg">
            Approved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="pt-4">
          {pendingLoading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
              No pending reviews — all caught up!
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((r: any) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  onApprove={() => handleApprove(r.id)}
                  onDelete={() => handleDelete(r.id)}
                  actionLoading={loadingId === r.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="pt-4">
          {approvedLoading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : approved.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No approved reviews yet.
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map((r: any) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  onDelete={() => handleDelete(r.id)}
                  actionLoading={loadingId === r.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReviewsManager;
