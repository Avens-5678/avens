import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PricingRule {
  id: string;
  tier_key: string;
  tier_label: string;
  markup_type: "percentage" | "flat";
  markup_min: number;
  markup_max: number;
  markup_default: number;
  applies_to: "rental" | "crew" | "venue" | "logistics";
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export const usePricingRules = () => {
  return useQuery({
    queryKey: ["pricing_rules"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("pricing_rules" as any) as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []) as PricingRule[];
    },
  });
};

/**
 * Given a vendor base price and a tier_key, compute the client-facing price.
 * For 'percentage' tiers: price * (1 + markup_default/100)
 * For 'flat' tiers: price + markup_default
 * 
 * Creative crew uses tiered commission based on package value:
 *  - Under ₹15K → creative_low (15%)
 *  - ₹15K–₹50K → creative_mid (12%)
 *  - Over ₹50K → creative_high (9%)
 */
export const applyTieredMarkup = (
  vendorBasePrice: number,
  tierKey: string,
  rules: PricingRule[]
): { clientPrice: number; platformFee: number; rule: PricingRule | null } => {
  // For creative crew, auto-select tier based on package value
  let effectiveTierKey = tierKey;
  if (tierKey === "creative_crew" || tierKey?.startsWith("creative")) {
    if (vendorBasePrice < 15000) effectiveTierKey = "creative_low";
    else if (vendorBasePrice <= 50000) effectiveTierKey = "creative_mid";
    else effectiveTierKey = "creative_high";
  }

  const rule = rules.find(r => r.tier_key === effectiveTierKey);
  if (!rule) {
    // Fallback to mid-tier
    const fallback = rules.find(r => r.tier_key === "mid");
    if (!fallback) return { clientPrice: vendorBasePrice, platformFee: 0, rule: null };
    const fee = Math.round(vendorBasePrice * fallback.markup_default / 100);
    return { clientPrice: vendorBasePrice + fee, platformFee: fee, rule: fallback };
  }

  if (rule.markup_type === "flat") {
    return { clientPrice: vendorBasePrice + rule.markup_default, platformFee: rule.markup_default, rule };
  }

  // Percentage
  const fee = Math.round(vendorBasePrice * rule.markup_default / 100);
  return { clientPrice: vendorBasePrice + fee, platformFee: fee, rule };
};
