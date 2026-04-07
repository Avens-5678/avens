import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import GoogleMapPicker from "@/components/shared/GoogleMapPicker";
import { Home, Briefcase, MapPin, Plus, Loader2, Trash2, Star } from "lucide-react";

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

const labelIcon = (label: string) => {
  const l = (label || "").toLowerCase();
  if (l.includes("home")) return <Home className="h-3.5 w-3.5" />;
  if (l.includes("work") || l.includes("office")) return <Briefcase className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
};

const SavedAddressesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    label: "Home",
    address_line: "",
    landmark: "",
    pincode: "",
    lat: null as number | null,
    lng: null as number | null,
  });

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase.from as any)("customer_addresses")
      .select("*").eq("user_id", user.id).order("is_default", { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const draftValid = draft.address_line.trim().length > 3 && draft.lat && draft.lng;

  const saveDraft = async () => {
    if (!user || !draftValid) return;
    setSaving(true);
    const { error } = await (supabase.from as any)("customer_addresses").insert({
      user_id: user.id,
      label: draft.label.trim() || "Home",
      address_line: draft.address_line,
      landmark: draft.landmark || null,
      lat: draft.lat,
      lng: draft.lng,
      pincode: draft.pincode || null,
      is_default: addresses.length === 0,
    });
    setSaving(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Address saved" });
    setDraft({ label: "Home", address_line: "", landmark: "", pincode: "", lat: null, lng: null });
    setShowAdd(false);
    await load();
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const { error } = await (supabase.from as any)("customer_addresses").delete().eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    await load();
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await (supabase.from as any)("customer_addresses").update({ is_default: false }).eq("user_id", user.id);
    await (supabase.from as any)("customer_addresses").update({ is_default: true }).eq("id", id);
    await load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Saved Addresses ({addresses.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && addresses.length === 0 && !showAdd && (
          <p className="text-sm text-muted-foreground">No saved addresses. Add one for one-click checkout.</p>
        )}
        {addresses.map((a) => (
          <div key={a.id} className="flex items-start justify-between border rounded-lg p-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="mt-0.5 text-muted-foreground">{labelIcon(a.label)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{a.label}</p>
                  {a.is_default && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" />Default</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{a.address_line}</p>
                {a.landmark && <p className="text-xs text-muted-foreground">Landmark: {a.landmark}</p>}
                {a.pincode && <p className="text-xs text-muted-foreground">PIN: {a.pincode}</p>}
              </div>
            </div>
            <div className="flex gap-1">
              {!a.is_default && (
                <Button size="sm" variant="ghost" onClick={() => setDefault(a.id)} title="Set as default">
                  <Star className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => deleteAddress(a.id)} title="Delete">
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {showAdd ? (
          <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <Label className="text-xs font-semibold">New address</Label>
            <div className="flex gap-1.5">
              {["Home", "Work", "Other"].map((l) => (
                <Button
                  key={l}
                  type="button"
                  size="sm"
                  variant={draft.label === l ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => setDraft({ ...draft, label: l })}
                >{l}</Button>
              ))}
            </div>
            <GoogleMapPicker
              height="220px"
              placeholder="Search address"
              onLocationSelect={(lat, lng, address, pincode) =>
                setDraft({
                  ...draft,
                  lat,
                  lng,
                  address_line: address || draft.address_line,
                  pincode: pincode || draft.pincode,
                })
              }
            />
            <Input
              placeholder="Address (auto-filled — edit if needed)"
              value={draft.address_line}
              onChange={(e) => setDraft({ ...draft, address_line: e.target.value })}
            />
            <Input
              placeholder="Landmark (optional)"
              value={draft.landmark}
              onChange={(e) => setDraft({ ...draft, landmark: e.target.value })}
            />
            <Input
              placeholder="Pincode"
              maxLength={6}
              value={draft.pincode}
              onChange={(e) => setDraft({ ...draft, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveDraft} disabled={!draftValid || saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save address"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAdd(true)}>
            <Plus className="h-3 w-3" /> Add new address
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedAddressesSection;
