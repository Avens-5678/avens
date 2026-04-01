import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePricingRules, PricingRule } from "@/hooks/usePricingRules";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, DollarSign, Percent, Plus, Trash2, TrendingUp } from "lucide-react";

const APPLIES_TO_OPTIONS = [
  { value: "rental", label: "Rental Items" },
  { value: "crew", label: "Crew Hub" },
  { value: "venue", label: "Venues" },
  { value: "logistics", label: "Logistics" },
];

const PricingRulesManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: rules, isLoading } = usePricingRules();
  const [rows, setRows] = useState<Array<Partial<PricingRule> & { _isNew?: boolean }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rules) setRows(rules.map(r => ({ ...r })));
  }, [rules]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete all existing and re-insert
      await (supabase.from("pricing_rules" as any) as any)
        .delete().neq("id", "00000000-0000-0000-0000-000000000000");

      if (rows.length > 0) {
        const { error } = await (supabase.from("pricing_rules" as any) as any).insert(
          rows.map((r, i) => ({
            tier_key: r.tier_key,
            tier_label: r.tier_label,
            markup_type: r.markup_type || "percentage",
            markup_min: r.markup_min || 0,
            markup_max: r.markup_max || 0,
            markup_default: r.markup_default || 0,
            applies_to: r.applies_to || "rental",
            description: r.description || null,
            display_order: i + 1,
            is_active: true,
          }))
        );
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["pricing_rules"] });
      toast({ title: "Saved", description: "Pricing rules updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => {
    setRows(prev => [...prev, {
      tier_key: "",
      tier_label: "",
      markup_type: "percentage" as const,
      markup_min: 0,
      markup_max: 0,
      markup_default: 0,
      applies_to: "rental" as const,
      description: "",
      _isNew: true,
    }]);
  };

  const updateRow = (i: number, patch: Partial<PricingRule>) => {
    setRows(prev => prev.map((r, j) => j === i ? { ...r, ...patch } : r));
  };

  const removeRow = (i: number) => setRows(prev => prev.filter((_, j) => j !== i));

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Tiered Pricing Rules
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure markup tiers for different item categories. Assign a <code className="text-xs bg-muted px-1 rounded">markup_tier</code> to each rental/inventory item.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((row, i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={row.markup_type === "flat" ? "secondary" : "default"} className="text-[10px]">
                    {row.markup_type === "flat" ? <DollarSign className="h-3 w-3 mr-0.5" /> : <Percent className="h-3 w-3 mr-0.5" />}
                    {row.markup_type === "flat" ? "Flat Rate" : "Percentage"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{row.applies_to}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeRow(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tier Key</Label>
                  <Input value={row.tier_key || ""} onChange={e => updateRow(i, { tier_key: e.target.value })} placeholder="e.g. micro" className="font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input value={row.tier_label || ""} onChange={e => updateRow(i, { tier_label: e.target.value })} placeholder="Micro & Commodity Items" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Applies To</Label>
                  <Select value={row.applies_to || "rental"} onValueChange={v => updateRow(i, { applies_to: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {APPLIES_TO_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={row.markup_type || "percentage"} onValueChange={v => updateRow(i, { markup_type: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Rate (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Min {row.markup_type === "flat" ? "(₹)" : "(%)"}</Label>
                  <Input type="number" value={row.markup_min ?? 0} onChange={e => updateRow(i, { markup_min: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max {row.markup_type === "flat" ? "(₹)" : "(%)"}</Label>
                  <Input type="number" value={row.markup_max ?? 0} onChange={e => updateRow(i, { markup_max: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Default {row.markup_type === "flat" ? "(₹)" : "(%)"}</Label>
                  <Input type="number" value={row.markup_default ?? 0} onChange={e => updateRow(i, { markup_default: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea value={row.description || ""} onChange={e => updateRow(i, { description: e.target.value })} rows={2} placeholder="What items belong to this tier..." className="text-sm" />
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addRow} className="gap-1">
            <Plus className="h-4 w-4" /> Add Tier
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        <Save className="h-4 w-4" /> Save Pricing Rules
      </Button>
    </div>
  );
};

export default PricingRulesManager;
