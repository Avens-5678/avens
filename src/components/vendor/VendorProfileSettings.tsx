import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, User, Building2, MapPin, FileText, BadgeCheck, Camera, X, Plus, Trash2, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import GoogleMapPicker from "@/components/shared/GoogleMapPicker";
import { validPincode, minLen } from "@/lib/validators";

const CREW_CATEGORIES = [
  { value: "photographer", label: "Photographer" },
  { value: "dj", label: "DJ" },
  { value: "decorator", label: "Decorator" },
  { value: "event_manager", label: "Event Manager" },
  { value: "caterer", label: "Caterer" },
  { value: "florist", label: "Florist" },
  { value: "mc", label: "MC / Anchor" },
  { value: "makeup_artist", label: "Makeup Artist" },
  { value: "security", label: "Security" },
  { value: "waitstaff", label: "Wait Staff" },
  { value: "loader", label: "Loader" },
];

const VendorProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [crewItemId, setCrewItemId] = useState<string | null>(null);
  const [isSavingCrew, setIsSavingCrew] = useState(false);
  const [crewProfile, setCrewProfile] = useState({
    crew_category: "",
    specializations: [] as string[],
    travel_radius_km: 50,
    outstation_fee: 0,
    past_events_count: 0,
    specializationInput: "",
  });
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    bio: "",
    address: "",
    godown_address: "",
    city: "",
    gst_number: "",
    pan_number: "",
    warehouse_pincode: "",
    warehouse_lat: 0,
    warehouse_lng: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          company_name: data.company_name || "",
          bio: data.bio || "",
          address: (data as any).address || "",
          godown_address: (data as any).godown_address || "",
          city: (data as any).city || "",
          gst_number: (data as any).gst_number || "",
          pan_number: (data as any).pan_number || "",
          warehouse_pincode: (data as any).warehouse_pincode || "",
          warehouse_lat: (data as any).warehouse_lat || 0,
          warehouse_lng: (data as any).warehouse_lng || 0,
        });
      }

      // Fetch crew inventory item if vendor has one
      const { data: crewItem } = await supabase
        .from("vendor_inventory")
        .select("id, crew_category, specializations, travel_radius_km, outstation_fee, past_events_count")
        .eq("vendor_id", user.id)
        .eq("service_type", "crew")
        .limit(1)
        .maybeSingle();

      if (crewItem) {
        setCrewItemId(crewItem.id);
        setCrewProfile({
          crew_category: (crewItem as any).crew_category || "",
          specializations: (crewItem as any).specializations || [],
          travel_radius_km: (crewItem as any).travel_radius_km ?? 50,
          outstation_fee: (crewItem as any).outstation_fee ?? 0,
          past_events_count: (crewItem as any).past_events_count ?? 0,
          specializationInput: "",
        });
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        company_name: profile.company_name,
        bio: profile.bio,
        address: profile.address,
        godown_address: profile.godown_address,
        city: profile.city,
        gst_number: profile.gst_number,
        pan_number: profile.pan_number,
        warehouse_pincode: profile.warehouse_pincode,
        warehouse_lat: profile.warehouse_lat || null,
        warehouse_lng: profile.warehouse_lng || null,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    }

    setIsSaving(false);
  };

  const handleSaveCrew = async () => {
    if (!user || !crewItemId) return;
    setIsSavingCrew(true);
    const { error } = await supabase
      .from("vendor_inventory")
      .update({
        crew_category: crewProfile.crew_category || null,
        specializations: crewProfile.specializations,
        travel_radius_km: crewProfile.travel_radius_km,
        outstation_fee: crewProfile.outstation_fee,
        past_events_count: crewProfile.past_events_count,
      } as any)
      .eq("id", crewItemId);
    if (error) {
      toast({ title: "Error", description: "Failed to save crew profile", variant: "destructive" });
    } else {
      toast({ title: "Crew Profile Saved", description: "Your crew details have been updated." });
    }
    setIsSavingCrew(false);
  };

  const addSpecialization = () => {
    const val = crewProfile.specializationInput.trim();
    if (val && !crewProfile.specializations.includes(val)) {
      setCrewProfile((p) => ({ ...p, specializations: [...p.specializations, val], specializationInput: "" }));
    }
  };

  const removeSpecialization = (s: string) => {
    setCrewProfile((p) => ({ ...p, specializations: p.specializations.filter((x) => x !== s) }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Verification progress
  const verificationChecks = [
    { label: "Full Name", done: !!profile.full_name },
    { label: "Phone Number", done: !!profile.phone },
    { label: "Company Name", done: !!profile.company_name },
    { label: "Business Address", done: !!profile.address },
    { label: "City", done: !!profile.city },
  ];
  const verifiedCount = verificationChecks.filter(c => c.done).length;
  const verifiedPercent = Math.round((verifiedCount / verificationChecks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Verification Progress */}
      <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-sm">Evnting Verified Progress</h3>
            <span className="ml-auto text-xs font-bold text-amber-700">{verifiedPercent}%</span>
          </div>
          <Progress value={verifiedPercent} className="h-2" />
          <div className="flex flex-wrap gap-2">
            {verificationChecks.map((check) => (
              <span key={check.label} className={`text-[10px] px-2 py-0.5 rounded-full ${check.done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {check.done ? "✓" : "○"} {check.label}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Complete your profile + add a virtual tour + get 3 reviews to earn the <strong className="text-amber-700">Evnting Verified</strong> badge.</p>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 XXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                This will be shared with clients once assigned.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Business / Company Name *</Label>
              <Input
                id="company_name"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                placeholder="Your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_number">GST Number</Label>
              <Input
                id="gst_number"
                value={profile.gst_number}
                onChange={(e) => setProfile({ ...profile, gst_number: e.target.value.toUpperCase() })}
                placeholder="e.g. 22AAAAA0000A1Z5"
                maxLength={15}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                value={profile.pan_number}
                onChange={(e) => setProfile({ ...profile, pan_number: e.target.value.toUpperCase() })}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="e.g. Hyderabad"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Your office / business address"
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="godown_address">Godown / Warehouse Address</Label>
              <Textarea
              id="godown_address"
              value={profile.godown_address}
              onChange={(e) => setProfile({ ...profile, godown_address: e.target.value })}
              placeholder="Where your equipment / inventory is stored"
              className="min-h-[80px]"
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse_pincode">Warehouse / Godown PIN Code</Label>
              <Input
                id="warehouse_pincode"
                value={profile.warehouse_pincode}
                onChange={(e) => setProfile({ ...profile, warehouse_pincode: e.target.value })}
                placeholder="e.g. 500081"
                maxLength={6}
              />
            </div>
          </div>

          {/* Map Pin Picker for exact warehouse location */}
          <div className="pt-2">
            <GoogleMapPicker
              label="Pin your exact warehouse location"
              description="Drop a pin on the map so we can calculate precise delivery distances."
              initialLat={profile.warehouse_lat || undefined}
              initialLng={profile.warehouse_lng || undefined}
              onLocationSelect={(lat, lng) => {
                setProfile(p => ({ ...p, warehouse_lat: lat, warehouse_lng: lng }));
              }}
              placeholder="Search your warehouse address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Multi-Warehouse Manager */}
      <WarehousesSection />

      {/* About Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            About Your Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Description</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Describe your services, specialties, and experience..."
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Crew Profile — shown when vendor has a crew inventory item */}
      {crewItemId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Crew Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Crew category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {CREW_CATEGORIES.map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={crewProfile.crew_category === cat.value ? "default" : "outline"}
                    className="cursor-pointer text-xs py-1 px-2.5"
                    onClick={() => setCrewProfile((p) => ({ ...p, crew_category: cat.value }))}
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div className="space-y-2">
              <Label>Specializations</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Wedding, Corporate, Birthday"
                  value={crewProfile.specializationInput}
                  onChange={(e) => setCrewProfile((p) => ({ ...p, specializationInput: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpecialization(); } }}
                />
                <Button type="button" variant="outline" onClick={addSpecialization} className="shrink-0">
                  Add
                </Button>
              </div>
              {crewProfile.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {crewProfile.specializations.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1 text-xs">
                      {s}
                      <button onClick={() => removeSpecialization(s)} className="ml-0.5 hover:text-destructive">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Travel radius + outstation fee */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="travel_radius">Travel Radius (km)</Label>
                <Input
                  id="travel_radius"
                  type="number"
                  min={0}
                  value={crewProfile.travel_radius_km}
                  onChange={(e) => setCrewProfile((p) => ({ ...p, travel_radius_km: Number(e.target.value) }))}
                  placeholder="50"
                />
                <p className="text-[11px] text-muted-foreground">Free travel within this range.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="outstation_fee">Outstation Fee (₹)</Label>
                <Input
                  id="outstation_fee"
                  type="number"
                  min={0}
                  value={crewProfile.outstation_fee}
                  onChange={(e) => setCrewProfile((p) => ({ ...p, outstation_fee: Number(e.target.value) }))}
                  placeholder="0"
                />
                <p className="text-[11px] text-muted-foreground">Extra charge beyond radius.</p>
              </div>
            </div>

            {/* Past events count */}
            <div className="space-y-2">
              <Label htmlFor="past_events_count">Past Events Count</Label>
              <Input
                id="past_events_count"
                type="number"
                min={0}
                value={crewProfile.past_events_count}
                onChange={(e) => setCrewProfile((p) => ({ ...p, past_events_count: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>

            <Button onClick={handleSaveCrew} disabled={isSavingCrew} variant="outline" className="w-full md:w-auto">
              {isSavingCrew && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Crew Profile
            </Button>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Multi-warehouse manager — vendor can add/edit/delete
// extra warehouses; saved to vendor_warehouses table
// ─────────────────────────────────────────────────────────
const WarehousesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<{ name: string; address: string; pincode: string; lat: number | null; lng: number | null }>({
    name: "", address: "", pincode: "", lat: null, lng: null,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase.from as any)("vendor_warehouses")
      .select("*").eq("vendor_id", user.id).order("is_primary", { ascending: false });
    setWarehouses(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const draftValid = draft.name.trim().length >= 2 && draft.lat && draft.lng &&
    (!draft.pincode || !validPincode(draft.pincode));

  const addWarehouse = async () => {
    if (!user || !draftValid) return;
    setSaving(true);
    try {
      const { error } = await (supabase.from as any)("vendor_warehouses").insert({
        vendor_id: user.id,
        name: draft.name.trim(),
        address: draft.address || "",
        lat: draft.lat,
        lng: draft.lng,
        pincode: draft.pincode || null,
        is_primary: warehouses.length === 0,
      });
      if (error) throw error;
      toast({ title: "Warehouse added" });
      setDraft({ name: "", address: "", pincode: "", lat: null, lng: null });
      setShowAdd(false);
      await load();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteWarehouse = async (id: string) => {
    if (!confirm("Delete this warehouse?")) return;
    const { error } = await (supabase.from as any)("vendor_warehouses").delete().eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    await load();
  };

  const setPrimary = async (id: string) => {
    if (!user) return;
    await (supabase.from as any)("vendor_warehouses").update({ is_primary: false }).eq("vendor_id", user.id);
    await (supabase.from as any)("vendor_warehouses").update({ is_primary: true }).eq("id", id);
    await load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Warehouses ({warehouses.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && warehouses.length === 0 && !showAdd && (
          <p className="text-sm text-muted-foreground">No additional warehouses yet.</p>
        )}
        {warehouses.map((w) => (
          <div key={w.id} className="flex items-start justify-between border rounded-lg p-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{w.name}</p>
                {w.is_primary && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" />Primary</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{w.address}</p>
              {w.pincode && <p className="text-xs text-muted-foreground">PIN: {w.pincode}</p>}
            </div>
            <div className="flex gap-1">
              {!w.is_primary && (
                <Button size="sm" variant="ghost" onClick={() => setPrimary(w.id)} title="Set as primary">
                  <Star className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => deleteWarehouse(w.id)} title="Delete">
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {showAdd ? (
          <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <Label className="text-xs font-semibold">New Warehouse</Label>
            <Input
              placeholder="Warehouse name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <GoogleMapPicker
              height="220px"
              placeholder="Search warehouse address"
              onLocationSelect={(lat, lng, address, pincode) =>
                setDraft({ ...draft, lat, lng, address: address || draft.address, pincode: pincode || draft.pincode })
              }
            />
            <Input
              placeholder="Address (auto-filled — edit if needed)"
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            />
            <Input
              placeholder="Pincode"
              maxLength={6}
              value={draft.pincode}
              onChange={(e) => setDraft({ ...draft, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
            />
            {draft.pincode && validPincode(draft.pincode) && (
              <p className="text-xs text-red-500">{validPincode(draft.pincode)}</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={addWarehouse} disabled={!draftValid || saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save warehouse"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAdd(true)}>
            <Plus className="h-3 w-3" /> Add new warehouse
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorProfileSettings;
