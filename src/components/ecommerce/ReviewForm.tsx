import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Upload, X, Loader2, CheckCircle2, Lock } from "lucide-react";

interface ReviewFormProps {
  rentalId: string;
  rentalTitle?: string;
}

const ReviewForm = ({ rentalId, rentalTitle }: ReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if user has a completed order for this item
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ["review-order-check", rentalId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase.from("rental_orders" as any) as any)
        .select("id, status")
        .eq("vendor_inventory_item_id", rentalId)
        .eq("client_id", user!.id)
        .in("status", ["completed", "confirmed", "delivered"])
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // Check if user already reviewed this item
  const { data: existingReview, isLoading: reviewLoading } = useQuery({
    queryKey: ["review-existing", rentalId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase.from("rental_reviews" as any) as any)
        .select("id, is_approved")
        .eq("rental_id", rentalId)
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - photoFiles.length);
    setPhotoFiles((prev) => [...prev, ...files].slice(0, 4));
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...previews].slice(0, 4));
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photoPreviews[idx]);
    setPhotoFiles((f) => f.filter((_, i) => i !== idx));
    setPhotoPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photoFiles.length === 0) return [];
    const urls: string[] = [];
    for (const file of photoFiles) {
      const ext = file.name.split(".").pop();
      const path = `reviews/${rentalId}/${user!.id}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("review-photos")
        .upload(path, file, { upsert: true });
      if (!error) {
        const { data: pub } = supabase.storage.from("review-photos").getPublicUrl(path);
        urls.push(pub.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({ title: "Write something", description: "Review text cannot be empty.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const photoUrls = await uploadPhotos();
      const { error } = await (supabase.from("rental_reviews" as any) as any).insert({
        rental_id: rentalId,
        user_id: user!.id,
        reviewer_name: user!.user_metadata?.full_name || user!.email?.split("@")[0] || "Customer",
        reviewer_email: user!.email,
        rating,
        review_text: text.trim(),
        photo_urls: photoUrls,
        verified_booking: !!orderData,
        rental_order_id: orderData?.id || null,
        is_approved: false,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["rental-reviews", rentalId] });
      queryClient.invalidateQueries({ queryKey: ["review-existing", rentalId, user?.id] });
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Submit failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Not logged in ---
  if (!user) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 flex-shrink-0" />
        <span>
          <button
            className="text-primary font-medium hover:underline"
            onClick={() => navigate("/auth")}
          >
            Sign in
          </button>{" "}
          to leave a review for {rentalTitle || "this item"}.
        </span>
      </div>
    );
  }

  // --- Loading order / existing review check ---
  if (orderLoading || reviewLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking eligibility...
      </div>
    );
  }

  // --- Already reviewed ---
  if (existingReview) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
        {existingReview.is_approved
          ? "You've already reviewed this item."
          : "Your review is pending approval. Thank you!"}
      </div>
    );
  }

  // --- Submitted successfully ---
  if (submitted) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        Review submitted — pending approval. Thank you!
      </div>
    );
  }

  return (
    <div className="space-y-4 border border-border rounded-xl p-5 bg-muted/20">
      <h3 className="text-sm font-semibold text-foreground">
        Write a Review
        {orderData && (
          <span className="ml-2 text-[10px] font-normal text-green-600 dark:text-green-400">
            ✓ Verified booking
          </span>
        )}
      </h3>

      {/* Star picker */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-widest text-primary">Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(s)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  s <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
          <span className="self-center ml-1 text-xs text-muted-foreground">
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][hoverRating || rating]}
          </span>
        </div>
      </div>

      {/* Review text */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-widest text-primary">Your Review</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience — quality, service, communication..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-[10px] text-muted-foreground text-right">{text.length}/1000</p>
      </div>

      {/* Photo upload */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-widest text-primary">
          Photos (optional, max 4)
        </Label>
        {photoPreviews.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {photoPreviews.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 hover:bg-black/80"
                >
                  <X className="h-2.5 w-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {photoFiles.length < 4 && (
          <label className="flex items-center gap-2 cursor-pointer w-fit px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Upload className="h-3.5 w-3.5" />
            Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={submitting} size="sm" className="gap-1.5">
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
};

export default ReviewForm;
