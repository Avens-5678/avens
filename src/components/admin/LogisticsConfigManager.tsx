import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLogisticsConfig, useTransportTiers } from "@/hooks/useLogisticsConfig";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Truck, Settings, Plus, Trash2 } from "lucide-react";

const LogisticsConfigManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: config, isLoading: configLoading } = useLogisticsConfig();
  const { data: tiers, isLoading: tiersLoading } = useTransportTiers();

  const [form, setForm] = useState({
    markup_percent: 30,
    labor_units_per_loader: 100,
    loader_daily_rate: 600,
    min_booking_hours: 48,
  });
  const [tierRows, setTierRows] = useState<Array<{
    id?: string;
    min_km: number;
    max_km: number | null;
    base_fee: number;
    per_km_fee: number;
    vehicle_type: string;
  }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        markup_percent: config.markup_percent,
        labor_units_per_loader: config.labor_units_per_loader,
        loader_daily_rate: config.loader_daily_rate,
        min_booking_hours: config.min_booking_hours,
      });
    }
  }, [config]);

  useEffect(() => {
    if (tiers) {
      setTierRows(tiers.map(t => ({
        id: t.id,
        min_km: t.min_km,
        max_km: t.max_km,
        base_fee: t.base_fee,
        per_km_fee: t.per_km_fee,
        vehicle_type: t.vehicle_type,
      })));
    }
  }, [tiers]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update config
      if (config) {
        const { error } = await (supabase.from("logistics_config" as any) as any)
          .update({
            markup_percent: form.markup_percent,
            labor_units_per_loader: form.labor_units_per_loader,
            loader_daily_rate: form.loader_daily_rate,
            min_booking_hours: form.min_booking_hours,
            updated_at: new Date().toISOString(),
          })
          .eq("id", config.id);
        if (error) throw error;
      }

      // Delete all existing tiers and re-insert
      await (supabase.from("transport_tiers" as any) as any).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (tierRows.length > 0) {
        const { error: tierError } = await (supabase.from("transport_tiers" as any) as any).insert(
          tierRows.map(t => ({
            min_km: t.min_km,
            max_km: t.max_km,
            base_fee: t.base_fee,
            per_km_fee: t.per_km_fee,
            vehicle_type: t.vehicle_type,
          }))
        );
        if (tierError) throw tierError;
      }

      await queryClient.invalidateQueries({ queryKey: ["logistics_config"] });
      await queryClient.invalidateQueries({ queryKey: ["transport_tiers"] });
      toast({ title: "Saved", description: "Logistics configuration updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (configLoading || tiersLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Pricing & Markup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Min Booking Hours</Label>
              <Input type="number" value={form.min_booking_hours} onChange={e => setForm(p => ({ ...p, min_booking_hours: parseInt(e.target.value) || 0 }))} />
              <p className="text-xs text-muted-foreground">Events less than this many hours away fall back to enquiry</p>
            </div>
            <div className="space-y-1 flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Markup is now managed via <strong>Pricing Rules</strong> (tiered per item category).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Manpower & Labor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Volume Units per Loader</Label>
              <Input type="number" value={form.labor_units_per_loader} onChange={e => setForm(p => ({ ...p, labor_units_per_loader: parseInt(e.target.value) || 100 }))} />
              <p className="text-xs text-muted-foreground">Every N volume units requires 1 loader</p>
            </div>
            <div className="space-y-1">
              <Label>Loader Daily Rate (₹)</Label>
              <Input type="number" value={form.loader_daily_rate} onChange={e => setForm(p => ({ ...p, loader_daily_rate: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Transport Tiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tierRows.map((tier, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Min KM</Label>
                <Input type="number" value={tier.min_km} onChange={e => {
                  const updated = [...tierRows];
                  updated[i] = { ...tier, min_km: parseInt(e.target.value) || 0 };
                  setTierRows(updated);
                }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max KM</Label>
                <Input type="number" value={tier.max_km ?? ""} placeholder="∞" onChange={e => {
                  const updated = [...tierRows];
                  updated[i] = { ...tier, max_km: e.target.value ? parseInt(e.target.value) : null };
                  setTierRows(updated);
                }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Base Fee (₹)</Label>
                <Input type="number" value={tier.base_fee} onChange={e => {
                  const updated = [...tierRows];
                  updated[i] = { ...tier, base_fee: parseFloat(e.target.value) || 0 };
                  setTierRows(updated);
                }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Per KM (₹)</Label>
                <Input type="number" value={tier.per_km_fee} onChange={e => {
                  const updated = [...tierRows];
                  updated[i] = { ...tier, per_km_fee: parseFloat(e.target.value) || 0 };
                  setTierRows(updated);
                }} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setTierRows(prev => prev.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setTierRows(prev => [...prev, { min_km: 0, max_km: null, base_fee: 0, per_km_fee: 0, vehicle_type: "Tata Ace" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add Tier
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        <Save className="h-4 w-4" /> Save Configuration
      </Button>
    </div>
  );
};

export default LogisticsConfigManager;
