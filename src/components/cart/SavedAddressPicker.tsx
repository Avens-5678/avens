import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Home, Briefcase, MapPin, Plus, Check, Loader2, Trash2 } from "lucide-react";

interface SavedAddress {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  landmark: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  pincode: string | null;
  is_default: boolean;
}

interface Props {
  onSelect: (addr: SavedAddress) => void;
  currentAddress: {
    venue_address_line1?: string;
    venue_address_line2?: string;
    venue_pincode?: string;
    venue_lat?: number;
    venue_lng?: number;
  };
}

const labelIcon = (label: string) => {
  const l = (label || "").toLowerCase();
  if (l.includes("home")) return <Home className="h-3.5 w-3.5" />;
  if (l.includes("work") || l.includes("office")) return <Briefcase className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
};

const SavedAddressPicker = ({ onSelect, currentAddress }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSave, setShowSave] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase.from as any)("customer_addresses")
      .select("*").eq("user_id", user.id).order("is_default", { ascending: false });
    setAddresses(data || []);
    // Auto-select default
    const def = (data || []).find((a: any) => a.is_default);
    if (def && !currentAddress.venue_address_line1) {
      setSelectedId(def.id);
      onSelect(def);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const saveCurrent = async () => {
    if (!user || !currentAddress.venue_address_line1) {
      toast({ title: "Pin a location first", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await (supabase.from as any)("customer_addresses").insert({
      user_id: user.id,
      label: newLabel.trim() || "Home",
      address_line: currentAddress.venue_address_line1,
      landmark: currentAddress.venue_address_line2 || null,
      lat: currentAddress.venue_lat || null,
      lng: currentAddress.venue_lng || null,
      pincode: currentAddress.venue_pincode || null,
      is_default: addresses.length === 0,
    });
    setSaving(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Address saved" });
    setShowSave(false);
    setNewLabel("Home");
    await load();
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const { error } = await (supabase.from as any)("customer_addresses").delete().eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    await load();
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading saved addresses…</div>;
  }

  return (
    <div className="space-y-2 border border-dashed border-border rounded-lg p-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">Saved addresses</Label>
        {currentAddress.venue_address_line1 && !showSave && (
          <Button type="button" variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowSave(true)}>
            <Plus className="h-3 w-3" /> Save current
          </Button>
        )}
      </div>

      {addresses.length === 0 && !showSave && (
        <p className="text-xs text-muted-foreground">No saved addresses yet. Pin a venue and save it for one-click checkout next time.</p>
      )}

      {addresses.length > 0 && (
        <div className="grid gap-1.5">
          {addresses.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => { setSelectedId(a.id); onSelect(a); }}
              className={`flex items-start gap-2 p-2 rounded-md border text-left text-xs transition ${
                selectedId === a.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <div className="mt-0.5 text-muted-foreground">{labelIcon(a.label)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{a.label}</span>
                  {a.is_default && <span className="text-[9px] uppercase text-emerald-600 font-bold">Default</span>}
                  {selectedId === a.id && <Check className="h-3 w-3 text-primary" />}
                </div>
                <p className="text-muted-foreground line-clamp-2">{a.address_line}{a.landmark ? `, ${a.landmark}` : ""}{a.pincode ? ` — ${a.pincode}` : ""}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteAddress(a.id); }}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      )}

      {showSave && (
        <div className="space-y-2 p-2 border border-border rounded-md bg-background">
          <Label className="text-xs">Label this address</Label>
          <div className="flex gap-1.5">
            {["Home", "Work", "Other"].map((l) => (
              <Button
                key={l}
                type="button"
                size="sm"
                variant={newLabel === l ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => setNewLabel(l)}
              >{l}</Button>
            ))}
          </div>
          {newLabel === "Other" && (
            <Input value={newLabel === "Other" ? "" : newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Custom label" className="h-7 text-xs" />
          )}
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={saveCurrent} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowSave(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedAddressPicker;
