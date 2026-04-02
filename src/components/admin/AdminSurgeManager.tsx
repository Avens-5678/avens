import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Plus, Loader2, TrendingUp, Trash2, Calendar, IndianRupee } from "lucide-react";
import { format, subDays } from "date-fns";

interface SurgeRule {
  id: string;
  name: string;
  city: string | null;
  category: string | null;
  rule_type: string;
  surge_multiplier: number;
  start_date: string | null;
  end_date: string | null;
  day_of_week: number[] | null;
  priority: number;
  is_active: boolean;
  created_at: string;
}

const RULE_TYPES = [
  { value: "date_range", label: "Date Range" },
  { value: "manual", label: "Manual" },
  { value: "demand_based", label: "Demand Based" },
];
const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "equipment", label: "Equipment" },
  { value: "venue", label: "Venue" },
  { value: "crew", label: "Crew" },
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AdminSurgeManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<SurgeRule | null>(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["admin-surge-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("surge_rules").select("*").order("priority", { ascending: false });
      if (error) throw error;
      return data as SurgeRule[];
    },
  });

  // Fetch surge history stats
  const { data: historyStats } = useQuery({
    queryKey: ["surge-history-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("surge_history")
        .select("multiplier_applied, original_price, surged_price")
        .gte("applied_at", thirtyDaysAgo);
      if (error) throw error;
      return data as { multiplier_applied: number; original_price: number; surged_price: number }[];
    },
  });

  const revenueFromSurge = (historyStats || []).reduce((s, h) => s + (h.surged_price - h.original_price), 0);
  const avgMultiplier = historyStats?.length
    ? (historyStats.reduce((s, h) => s + h.multiplier_applied, 0) / historyStats.length)
    : 0;

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("surge_rules").update({ is_active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-surge-rules"] }),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("surge_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-surge-rules"] });
      toast({ title: "Rule deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5" />Surge Pricing</h2>
          <p className="text-sm text-muted-foreground">{rules.filter((r) => r.is_active).length} active rules</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setEditRule(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />Create Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-foreground">{rules.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Rules</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-amber-600">₹{Math.round(revenueFromSurge).toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-muted-foreground">Surge Revenue (30d)</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-foreground">{avgMultiplier ? `${avgMultiplier.toFixed(2)}x` : "—"}</p>
          <p className="text-[10px] text-muted-foreground">Avg Multiplier</p>
        </CardContent></Card>
      </div>

      {/* Rules Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Rule</TableHead>
                  <TableHead className="text-xs w-[80px]">Type</TableHead>
                  <TableHead className="text-xs w-[70px]">Multiplier</TableHead>
                  <TableHead className="text-xs w-[100px]">Scope</TableHead>
                  <TableHead className="text-xs w-[120px]">Dates</TableHead>
                  <TableHead className="text-xs w-[50px]">Priority</TableHead>
                  <TableHead className="text-xs w-[60px]">Active</TableHead>
                  <TableHead className="text-xs w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-muted/30">
                    <TableCell>
                      <p className="text-sm font-medium">{rule.name}</p>
                      {rule.day_of_week && rule.day_of_week.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">{rule.day_of_week.map((d) => DAYS[d]).join(", ")}</p>
                      )}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{rule.rule_type.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-sm font-bold text-amber-600">{rule.surge_multiplier}x</TableCell>
                    <TableCell>
                      <div className="text-[10px] text-muted-foreground">
                        {rule.city || "All cities"}
                        {rule.category && ` · ${rule.category}`}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                      {rule.start_date ? `${format(new Date(rule.start_date), "dd MMM")} → ${rule.end_date ? format(new Date(rule.end_date), "dd MMM") : "∞"}` : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-center">{rule.priority}</TableCell>
                    <TableCell>
                      <Switch checked={rule.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: rule.id, is_active: v })} className="scale-75" />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 px-1.5 text-destructive" onClick={() => { if (confirm("Delete?")) deleteRule.mutate(rule.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Live Preview */}
      <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Preview: ₹10,000 product</p>
          <div className="flex items-center justify-center gap-3">
            {rules.filter((r) => r.is_active && r.rule_type !== "demand_based").slice(0, 3).map((r) => (
              <div key={r.id} className="text-center">
                <p className="text-xs text-muted-foreground">{r.name}</p>
                <p className="text-lg font-bold text-amber-600">₹{Math.round(10000 * r.surge_multiplier).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SurgeRuleDialog open={dialogOpen} onOpenChange={setDialogOpen} editData={editRule} />
    </div>
  );
};

// ── Create/Edit Rule Dialog ──
const SurgeRuleDialog = ({ open, onOpenChange, editData }: { open: boolean; onOpenChange: (v: boolean) => void; editData: SurgeRule | null }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: editData?.name || "",
    city: editData?.city || "",
    category: editData?.category || "",
    rule_type: editData?.rule_type || "date_range",
    surge_multiplier: editData?.surge_multiplier || 1.15,
    start_date: editData?.start_date || "",
    end_date: editData?.end_date || "",
    day_of_week: editData?.day_of_week || ([] as number[]),
    priority: editData?.priority || 5,
  });

  const toggleDay = (d: number) => {
    setForm((f) => ({
      ...f,
      day_of_week: f.day_of_week.includes(d) ? f.day_of_week.filter((x) => x !== d) : [...f.day_of_week, d],
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name,
        city: form.city || null,
        category: form.category || null,
        rule_type: form.rule_type,
        surge_multiplier: form.surge_multiplier,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        day_of_week: form.day_of_week.length > 0 ? form.day_of_week : null,
        priority: form.priority,
      };
      if (editData) {
        const { error } = await supabase.from("surge_rules").update(payload).eq("id", editData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("surge_rules").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-surge-rules"] });
      onOpenChange(false);
      toast({ title: editData ? "Rule updated" : "Rule created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const previewPrice = Math.round(10000 * form.surge_multiplier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editData ? "Edit" : "Create"} Surge Rule</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Rule Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wedding Season Peak" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RULE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">City (leave blank for all)</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Hyderabad" />
          </div>

          {/* Multiplier slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Surge Multiplier</Label>
              <span className="text-sm font-bold text-amber-600">{form.surge_multiplier.toFixed(2)}x</span>
            </div>
            <Slider
              value={[form.surge_multiplier * 100]}
              onValueChange={([v]) => setForm({ ...form, surge_multiplier: Math.round(v) / 100 })}
              min={100} max={200} step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1.0x (no surge)</span>
              <span>₹10,000 → ₹{previewPrice.toLocaleString("en-IN")}</span>
              <span>2.0x</span>
            </div>
          </div>

          {form.rule_type === "date_range" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Start Date</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">End Date</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Days of Week (optional, for recurring)</Label>
                <div className="flex gap-1.5">
                  {DAYS.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`w-8 h-8 rounded-full text-[10px] font-medium transition-colors ${form.day_of_week.includes(i) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Priority (higher = takes precedence)</Label>
            <Input type="number" min={0} max={100} value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={!form.name.trim() || saveMutation.isPending} className="w-full">
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editData ? "Update" : "Create"} Rule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSurgeManager;
