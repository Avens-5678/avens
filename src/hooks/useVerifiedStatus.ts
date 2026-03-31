import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VerifiedResult {
  isVerified: boolean;
  completionPercent: number;
  missingItems: string[];
}

export const useVerifiedStatus = (itemId?: string, vendorId?: string): VerifiedResult => {
  const { data: profile } = useQuery({
    queryKey: ["verified-profile", vendorId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("company_name, phone, address, avatar_url")
        .eq("user_id", vendorId!)
        .maybeSingle();
      return data;
    },
    enabled: !!vendorId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: item } = useQuery({
    queryKey: ["verified-item", itemId],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_inventory")
        .select("virtual_tour_url")
        .eq("id", itemId!)
        .maybeSingle();
      return data as { virtual_tour_url: string | null } | null;
    },
    enabled: !!itemId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: reviewCount = 0 } = useQuery({
    queryKey: ["verified-reviews", itemId],
    queryFn: async () => {
      const { count } = await (supabase.from("rental_reviews" as any) as any)
        .select("id", { count: "exact", head: true })
        .eq("rental_id", itemId!)
        .eq("is_approved", true);
      return count || 0;
    },
    enabled: !!itemId,
    staleTime: 10 * 60 * 1000,
  });

  const missing: string[] = [];
  let total = 3;
  let done = 0;

  // Check 1: Profile completeness
  const profileComplete = !!(
    profile?.company_name && profile?.phone && profile?.address && profile?.avatar_url
  );
  if (profileComplete) done++;
  else missing.push("Complete business profile (name, phone, address, photo)");

  // Check 2: Virtual tour
  const hasTour = !!item?.virtual_tour_url;
  if (hasTour) done++;
  else missing.push("Add a 360° virtual tour or walkthrough");

  // Check 3: 3+ approved reviews
  const hasReviews = reviewCount >= 3;
  if (hasReviews) done++;
  else missing.push(`Get ${3 - reviewCount} more approved review${3 - reviewCount !== 1 ? "s" : ""}`);

  return {
    isVerified: done === total,
    completionPercent: Math.round((done / total) * 100),
    missingItems: missing,
  };
};
