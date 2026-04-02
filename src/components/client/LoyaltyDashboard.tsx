import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Star, Gift, Copy, Share2, TrendingUp, Award, Clock,
  Loader2, CheckCircle2, Users, ArrowUpRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface LoyaltyAccount {
  id: string;
  total_points_earned: number;
  total_points_redeemed: number;
  current_balance: number;
  current_tier_id: string | null;
}

interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  multiplier: number;
  perks: string[];
  badge_color: string;
  display_order: number;
}

interface PointEntry {
  id: string;
  points: number;
  type: string;
  description: string;
  created_at: string;
}

interface ReferralCode {
  id: string;
  code: string;
  total_referrals: number;
  total_earnings: number;
}

interface Redemption {
  id: string;
  referred_id: string;
  status: string;
  created_at: string;
}

const TYPE_ICONS: Record<string, { icon: any; color: string }> = {
  order_earned: { icon: TrendingUp, color: "text-emerald-500" },
  referral_bonus: { icon: Users, color: "text-blue-500" },
  review_bonus: { icon: Star, color: "text-amber-500" },
  birthday_bonus: { icon: Gift, color: "text-pink-500" },
  promotion: { icon: Award, color: "text-purple-500" },
  redeemed: { icon: ArrowUpRight, color: "text-red-500" },
  adjustment: { icon: Clock, color: "text-muted-foreground" },
};

const LoyaltyDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch tiers
  const { data: tiers = [] } = useQuery({
    queryKey: ["loyalty-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("loyalty_tiers").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data as LoyaltyTier[];
    },
  });

  // Fetch account
  const { data: account, isLoading } = useQuery({
    queryKey: ["loyalty-account", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("loyalty_accounts").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data as LoyaltyAccount | null;
    },
  });

  // Fetch points history
  const { data: points = [] } = useQuery({
    queryKey: ["loyalty-points", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("loyalty_points").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data as PointEntry[];
    },
  });

  // Fetch referral code
  const { data: referralCode } = useQuery({
    queryKey: ["referral-code", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("referral_codes").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data as ReferralCode | null;
    },
  });

  // Fetch referral redemptions
  const { data: redemptions = [] } = useQuery({
    queryKey: ["referral-redemptions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("referral_redemptions").select("*").eq("referrer_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Redemption[];
    },
  });

  const currentTier = useMemo(() => tiers.find((t) => t.id === account?.current_tier_id), [tiers, account]);
  const nextTier = useMemo(() => {
    if (!currentTier) return tiers[0];
    const idx = tiers.findIndex((t) => t.id === currentTier.id);
    return idx < tiers.length - 1 ? tiers[idx + 1] : null;
  }, [tiers, currentTier]);

  const progressToNext = useMemo(() => {
    if (!account || !nextTier) return 100;
    const earned = account.total_points_earned;
    const currentMin = currentTier?.min_points || 0;
    const nextMin = nextTier.min_points;
    return Math.min(100, Math.round(((earned - currentMin) / (nextMin - currentMin)) * 100));
  }, [account, currentTier, nextTier]);

  const pointsToNext = nextTier ? Math.max(0, nextTier.min_points - (account?.total_points_earned || 0)) : 0;

  const copyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast({ title: "Copied!", description: referralCode.code });
    }
  };

  const shareWhatsApp = () => {
    if (!referralCode?.code) return;
    const link = `${window.location.origin}/?ref=${referralCode.code}`;
    const text = `Book event rentals on Evnting! Use my code ${referralCode.code} and get 100 bonus points. ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Loyalty & Rewards</h2>

      {/* ── Section 1: Tier Card ── */}
      <Card className="overflow-hidden">
        <div className="h-2" style={{ backgroundColor: currentTier?.badge_color || "#B4B2A9" }} />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTier?.badge_color || "#B4B2A9"}20` }}>
                <Award className="h-6 w-6" style={{ color: currentTier?.badge_color || "#B4B2A9" }} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{currentTier?.name || "Silver"} Member</p>
                <p className="text-xs text-muted-foreground">{currentTier?.multiplier || 1}x points multiplier</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">{(account?.current_balance || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">points balance</p>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{currentTier?.name}</span>
                <span className="font-medium text-foreground">{nextTier.name}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressToNext}%`, backgroundColor: nextTier.badge_color }} />
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                {pointsToNext > 0 ? `${pointsToNext} more points to ${nextTier.name}` : `You've reached ${nextTier.name}!`}
              </p>
            </div>
          )}

          {/* Perks */}
          {currentTier?.perks && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Perks</p>
              <div className="flex flex-wrap gap-1.5">
                {(currentTier.perks as string[]).map((perk, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />{perk}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 2: Points Summary + History ── */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">+{(account?.total_points_earned || 0).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Earned</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-red-500">{(account?.total_points_redeemed || 0).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Redeemed</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-foreground">{(account?.current_balance || 0).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Balance</p>
        </CardContent></Card>
      </div>

      {/* Points History */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Points History</h3>
        {points.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 bg-muted/30 rounded-lg">No points activity yet. Make your first booking to earn points!</p>
        ) : (
          <div className="space-y-1.5">
            {points.map((p) => {
              const ti = TYPE_ICONS[p.type] || TYPE_ICONS.adjustment;
              const Icon = ti.icon;
              return (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-muted ${ti.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{p.description}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${p.points > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {p.points > 0 ? "+" : ""}{p.points}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* ── Section 3: Refer & Earn ── */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <Gift className="h-4 w-4 text-primary" />Refer & Earn
        </h3>
        <Card className="bg-gradient-to-br from-primary/5 to-primary/[0.02]">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Share your code — you get <strong className="text-foreground">200 points</strong> when they complete their first order. They get <strong className="text-foreground">100 points</strong> on signup!</p>

            {referralCode ? (
              <>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-center font-mono font-bold text-lg text-foreground tracking-wider">
                    {referralCode.code}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyCode}><Copy className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={shareWhatsApp} className="text-emerald-600"><Share2 className="h-4 w-4" /></Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <p className="text-lg font-bold text-foreground">{referralCode.total_referrals}</p>
                    <p className="text-[10px] text-muted-foreground">Friends Referred</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <p className="text-lg font-bold text-emerald-600">{referralCode.total_earnings}</p>
                    <p className="text-[10px] text-muted-foreground">Points Earned</p>
                  </div>
                </div>

                {redemptions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Recent Referrals</p>
                    {redemptions.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-background/50">
                        <span className="text-muted-foreground">{r.referred_id.slice(0, 8)}...</span>
                        <Badge variant="secondary" className={`text-[9px] ${r.status === "rewards_issued" ? "bg-emerald-100 text-emerald-700" : r.status === "first_order_completed" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {r.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Your referral code is being generated...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earning guide */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h4 className="text-sm font-semibold text-foreground">How to Earn Points</h4>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p className="flex justify-between"><span>Every ₹100 spent</span><span className="font-medium text-foreground">10 points</span></p>
            <p className="flex justify-between"><span>Leave a review</span><span className="font-medium text-foreground">50 points</span></p>
            <p className="flex justify-between"><span>Bundle order bonus</span><span className="font-medium text-foreground">100 points</span></p>
            <p className="flex justify-between"><span>Refer a friend (their first order)</span><span className="font-medium text-foreground">200 points</span></p>
            <p className="flex justify-between"><span>100 points</span><span className="font-medium text-foreground">= ₹50 discount</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyDashboard;
