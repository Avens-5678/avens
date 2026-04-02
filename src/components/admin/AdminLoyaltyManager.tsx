import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Award, Users, TrendingUp, Search, Loader2, Plus, Minus, Gift } from "lucide-react";
import { format } from "date-fns";

interface LoyaltyAccount {
  id: string;
  user_id: string;
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
  badge_color: string;
}

interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  total_referrals: number;
  total_earnings: number;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string;
}

const AdminLoyaltyManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustDialog, setAdjustDialog] = useState<{ userId: string; name: string } | null>(null);
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  // Fetch tiers
  const { data: tiers = [] } = useQuery({
    queryKey: ["admin-loyalty-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("loyalty_tiers").select("*").order("display_order");
      if (error) throw error;
      return data as LoyaltyTier[];
    },
  });
  const tierMap = useMemo(() => { const m: Record<string, LoyaltyTier> = {}; tiers.forEach((t) => { m[t.id] = t; }); return m; }, [tiers]);

  // Fetch all accounts
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["admin-loyalty-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("loyalty_accounts").select("*").order("total_points_earned", { ascending: false });
      if (error) throw error;
      return data as LoyaltyAccount[];
    },
  });

  // Fetch profiles for names
  const userIds = accounts.map((a) => a.user_id);
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-loyalty-profiles", userIds.join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds);
      if (error) throw error;
      return data as Profile[];
    },
  });
  const profileMap = useMemo(() => { const m: Record<string, Profile> = {}; profiles.forEach((p) => { m[p.user_id] = p; }); return m; }, [profiles]);

  // Fetch top referrers
  const { data: topReferrers = [] } = useQuery({
    queryKey: ["admin-top-referrers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("referral_codes").select("*").gt("total_referrals", 0).order("total_referrals", { ascending: false }).limit(10);
      if (error) throw error;
      return data as ReferralCode[];
    },
  });

  // Stats
  const totalCirculation = accounts.reduce((s, a) => s + a.current_balance, 0);
  const totalRedeemed = accounts.reduce((s, a) => s + a.total_points_redeemed, 0);
  const tierCounts = useMemo(() => {
    const m: Record<string, number> = {};
    tiers.forEach((t) => { m[t.name] = 0; });
    accounts.forEach((a) => { const t = a.current_tier_id ? tierMap[a.current_tier_id] : null; if (t) m[t.name] = (m[t.name] || 0) + 1; });
    return m;
  }, [accounts, tiers, tierMap]);

  // Filter
  const filtered = useMemo(() => {
    if (!searchTerm) return accounts;
    const q = searchTerm.toLowerCase();
    return accounts.filter((a) => {
      const p = profileMap[a.user_id];
      return (p?.full_name || "").toLowerCase().includes(q) || (p?.email || "").toLowerCase().includes(q);
    });
  }, [accounts, searchTerm, profileMap]);

  // Adjust points
  const adjustMutation = useMutation({
    mutationFn: async () => {
      if (!adjustDialog) return;
      const pts = parseInt(adjustPoints);
      if (!pts || !adjustReason.trim()) throw new Error("Points and reason required");
      await supabase.rpc("award_loyalty_points", {
        p_user_id: adjustDialog.userId, p_points: pts, p_type: "adjustment",
        p_description: adjustReason.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loyalty-accounts"] });
      setAdjustDialog(null);
      setAdjustPoints("");
      setAdjustReason("");
      toast({ title: "Points adjusted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2"><Award className="h-5 w-5" />Loyalty Program</h2>
        <p className="text-sm text-muted-foreground">{accounts.length} members</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-foreground">{accounts.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Members</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{totalCirculation.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Points in Circulation</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-red-500">{totalRedeemed.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Redeemed</p>
        </CardContent></Card>
        {tiers.map((t) => (
          <Card key={t.id}><CardContent className="p-3 text-center">
            <p className="text-xl font-bold" style={{ color: t.badge_color }}>{tierCounts[t.name] || 0}</p>
            <p className="text-[10px] text-muted-foreground">{t.name} Members</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Search + Member List */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search members..." className="pl-8 h-8 text-xs" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Member</TableHead>
                  <TableHead className="text-xs w-[70px]">Tier</TableHead>
                  <TableHead className="text-xs w-[80px] text-right">Balance</TableHead>
                  <TableHead className="text-xs w-[80px] text-right">Earned</TableHead>
                  <TableHead className="text-xs w-[80px] text-right">Redeemed</TableHead>
                  <TableHead className="text-xs w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map((acct) => {
                  const p = profileMap[acct.user_id];
                  const tier = acct.current_tier_id ? tierMap[acct.current_tier_id] : null;
                  return (
                    <TableRow key={acct.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{p?.full_name || acct.user_id.slice(0, 8)}</p>
                        <p className="text-[10px] text-muted-foreground">{p?.email || ""}</p>
                      </TableCell>
                      <TableCell>
                        {tier && <Badge variant="secondary" className="text-[9px]" style={{ backgroundColor: `${tier.badge_color}20`, color: tier.badge_color }}>{tier.name}</Badge>}
                      </TableCell>
                      <TableCell className="text-right text-sm font-bold">{acct.current_balance.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-emerald-600">+{acct.total_points_earned.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-red-500">{acct.total_points_redeemed.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setAdjustDialog({ userId: acct.user_id, name: p?.full_name || "User" })}>Adjust</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Top Referrers */}
      {topReferrers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5"><Gift className="h-4 w-4" />Top Referrers</h3>
          <div className="flex flex-wrap gap-2">
            {topReferrers.map((r) => {
              const p = profileMap[r.user_id];
              return (
                <Badge key={r.id} variant="outline" className="text-xs gap-1">
                  {p?.full_name || r.code} — {r.total_referrals} referrals ({r.total_earnings} pts)
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Adjust Points Dialog */}
      <Dialog open={!!adjustDialog} onOpenChange={(o) => { if (!o) setAdjustDialog(null); }}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-base">Adjust Points — {adjustDialog?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Points (positive to add, negative to deduct)</Label>
              <Input type="number" value={adjustPoints} onChange={(e) => setAdjustPoints(e.target.value)} placeholder="100 or -50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reason</Label>
              <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Manual adjustment reason..." />
            </div>
            <Button onClick={() => adjustMutation.mutate()} disabled={!adjustPoints || !adjustReason.trim() || adjustMutation.isPending} className="w-full" size="sm">
              {adjustMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}Adjust Points
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLoyaltyManager;
