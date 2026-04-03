import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Trash2, Loader2, ArrowLeft, ArrowRight, Check, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";

interface BundleItem {
  rental_id: string;
  title: string;
  quantity: number;
  price: number;
  image_url?: string;
}

const EVENT_TYPES = ["Wedding", "Corporate", "Birthday", "Concert", "Exhibition", "Other"];

const VendorBundleManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── Create flow state ──
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [bundleName, setBundleName] = useState("");
  const [bundleDesc, setBundleDesc] = useState("");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [bannerUrl, setBannerUrl] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bundlePrice, setBundlePrice] = useState(0);
  const [uploading, setUploading] = useState(false);

  // ── Fetch vendor's bundles ──
  const { data: myBundles = [], isLoading } = useQuery({
    queryKey: ["vendor-product-bundles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_bundles")
        .select("*")
        .eq("trigger_service_type", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // ── Fetch vendor's active inventory for selection ──
  const { data: myListings = [] } = useQuery({
    queryKey: ["vendor-listings-for-bundle", user?.id],
    enabled: !!user && creating,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_inventory")
        .select("id, name, price_value, image_url, categories")
        .eq("vendor_id", user!.id)
        .eq("is_available", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const selectedListings = useMemo(
    () => myListings.filter((l: any) => selectedIds.includes(l.id)),
    [myListings, selectedIds]
  );
  const individualTotal = useMemo(
    () => selectedListings.reduce((s: number, l: any) => s + (l.price_value || 0), 0),
    [selectedListings]
  );
  const savings = individualTotal - bundlePrice;
  const savingsPercent = individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0;
  const minPrice = Math.round(individualTotal * 0.7);

  // ── Upload banner image ──
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("vendor-photos").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("vendor-photos").getPublicUrl(path);
      setBannerUrl(urlData.publicUrl);
    }
    setUploading(false);
  };

  // ── Publish bundle ──
  const publishBundle = useMutation({
    mutationFn: async () => {
      const bundleItems: BundleItem[] = selectedListings.map((l: any) => ({
        rental_id: l.id,
        title: l.name,
        quantity: 1,
        price: l.price_value || 0,
        image_url: l.image_url || "",
      }));
      const discountPercent = savingsPercent > 0 ? savingsPercent : 0;
      const { error } = await supabase.from("product_bundles").insert({
        name: bundleName,
        description: bundleDesc || null,
        image_url: bannerUrl || null,
        bundle_items: bundleItems as any,
        total_price: bundlePrice,
        discount_percent: discountPercent,
        trigger_service_type: user!.id, // vendor_id stored here
        trigger_categories: eventTypes.length > 0 ? eventTypes : null,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-product-bundles"] });
      toast({ title: "Bundle published!" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Toggle active ──
  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("product_bundles").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor-product-bundles"] }),
  });

  // ── Delete bundle ──
  const deleteBundle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_bundles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-product-bundles"] });
      toast({ title: "Bundle deleted" });
    },
  });

  const resetForm = () => {
    setCreating(false);
    setStep(1);
    setBundleName("");
    setBundleDesc("");
    setEventTypes([]);
    setBannerUrl("");
    setSelectedIds([]);
    setBundlePrice(0);
  };

  // ── Step validation ──
  const canNext = () => {
    if (step === 1) return bundleName.trim().length > 0;
    if (step === 2) return selectedIds.length >= 2;
    if (step === 3) return bundlePrice > 0;
    return true;
  };

  // ── CREATE FLOW ──
  if (creating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={resetForm} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`w-8 h-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        {/* STEP 1 — Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Bundle basics</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Bundle name *</label>
              <Input value={bundleName} onChange={(e) => setBundleName(e.target.value)} placeholder="e.g. Full Wedding Package" className="mt-1" maxLength={80} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Short description</label>
              <textarea
                value={bundleDesc}
                onChange={(e) => setBundleDesc(e.target.value)}
                placeholder="Everything you need for a stunning event..."
                className="mt-1 w-full border border-border rounded-lg p-3 text-sm bg-background text-foreground resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={150}
              />
              <p className="text-[10px] text-muted-foreground text-right">{bundleDesc.length}/150</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Event types</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {EVENT_TYPES.map((et) => (
                  <button
                    key={et}
                    onClick={() => setEventTypes((prev) => prev.includes(et) ? prev.filter((t) => t !== et) : [...prev, et])}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      eventTypes.includes(et) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {et}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Banner image</label>
              <div className="mt-1.5">
                {bannerUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-[3/1] bg-muted">
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    <button onClick={() => setBannerUrl("")} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full hover:bg-background">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl h-28 cursor-pointer hover:border-primary/40 transition-colors">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
                      <>
                        <ImageIcon className="h-6 w-6 text-muted-foreground/50 mb-1" />
                        <span className="text-xs text-muted-foreground">Click to upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Select listings */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Select your listings</h3>
            <p className="text-xs text-muted-foreground">Choose at least 2 items to include in this bundle.</p>
            {myListings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active listings found. Add inventory items first.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myListings.map((listing: any) => {
                  const selected = selectedIds.includes(listing.id);
                  return (
                    <button
                      key={listing.id}
                      onClick={() => setSelectedIds((prev) => selected ? prev.filter((id) => id !== listing.id) : [...prev, listing.id])}
                      className={`relative border rounded-xl overflow-hidden text-left transition-all ${
                        selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="aspect-square bg-muted">
                        {listing.image_url ? (
                          <img src={listing.image_url} alt={listing.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="h-6 w-6 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium text-foreground line-clamp-2">{listing.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{"\u20B9"}{(listing.price_value || 0).toLocaleString("en-IN")}</p>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{selectedIds.length} item{selectedIds.length !== 1 ? "s" : ""} selected</p>
          </div>
        )}

        {/* STEP 3 — Set price */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Set bundle price</h3>
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Individual total ({selectedIds.length} items)</span>
                <span className="font-bold text-foreground">{"\u20B9"}{individualTotal.toLocaleString("en-IN")}</span>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Bundle price *</label>
                <Input
                  type="number"
                  value={bundlePrice || ""}
                  onChange={(e) => setBundlePrice(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder={`e.g. ${Math.round(individualTotal * 0.9)}`}
                  className="mt-1"
                  min={0}
                />
              </div>
              {bundlePrice > 0 && savings > 0 && (
                <p className="text-sm font-medium text-emerald-600">
                  Customers save {"\u20B9"}{savings.toLocaleString("en-IN")} ({savingsPercent}%)
                </p>
              )}
              {bundlePrice > 0 && bundlePrice < minPrice && (
                <p className="text-xs text-amber-600">
                  Warning: Price is below 70% of individual total ({"\u20B9"}{minPrice.toLocaleString("en-IN")})
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 — Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Review & publish</h3>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              {bannerUrl && <img src={bannerUrl} className="w-full aspect-[3/1] object-cover rounded-lg" />}
              <h4 className="text-base font-bold text-foreground">{bundleName}</h4>
              {bundleDesc && <p className="text-sm text-muted-foreground">{bundleDesc}</p>}
              {eventTypes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {eventTypes.map((et) => <Badge key={et} variant="secondary" className="text-[10px]">{et}</Badge>)}
                </div>
              )}
              <Separator />
              <p className="text-xs text-muted-foreground font-medium">{selectedIds.length} items included:</p>
              <div className="space-y-1.5">
                {selectedListings.map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate">{l.name}</span>
                    <span className="text-muted-foreground flex-shrink-0">{"\u20B9"}{(l.price_value || 0).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground line-through">{"\u20B9"}{individualTotal.toLocaleString("en-IN")}</span>
                <span className="font-bold text-foreground text-base">{"\u20B9"}{bundlePrice.toLocaleString("en-IN")}</span>
              </div>
              {savings > 0 && <p className="text-xs text-emerald-600 font-medium">Customer saves {savingsPercent}%</p>}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          ) : <div />}
          {step < 4 ? (
            <Button size="sm" disabled={!canNext()} onClick={() => { if (step === 3 && !bundlePrice) setBundlePrice(Math.round(individualTotal * 0.9)); setStep(step + 1); }}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={() => publishBundle.mutate()} disabled={publishBundle.isPending}>
              {publishBundle.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Publish Bundle
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">My Packages</h2>
          <p className="text-sm text-muted-foreground">{myBundles.length} bundle{myBundles.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create Bundle
        </Button>
      </div>

      {myBundles.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No bundles yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create a bundle to offer customers package deals</p>
          <Button size="sm" variant="outline" onClick={() => setCreating(true)} className="mt-4 gap-1.5">
            <Plus className="h-4 w-4" /> Create your first bundle
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {myBundles.map((bundle: any) => {
            const items: BundleItem[] = Array.isArray(bundle.bundle_items) ? bundle.bundle_items : [];
            const itemSum = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
            return (
              <div key={bundle.id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                {bundle.image_url ? (
                  <img src={bundle.image_url} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground truncate">{bundle.name}</h4>
                    <Switch
                      checked={bundle.is_active}
                      onCheckedChange={(checked) => toggleActive.mutate({ id: bundle.id, active: checked })}
                      className="scale-75 flex-shrink-0"
                    />
                  </div>
                  {bundle.trigger_categories?.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {bundle.trigger_categories.map((t: string) => <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{items.length} items</span>
                    <span>&middot;</span>
                    {itemSum > (bundle.total_price || 0) && (
                      <span className="line-through">{"\u20B9"}{itemSum.toLocaleString("en-IN")}</span>
                    )}
                    <span className="font-bold text-foreground">{"\u20B9"}{(bundle.total_price || 0).toLocaleString("en-IN")}</span>
                    {bundle.discount_percent > 0 && (
                      <Badge className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{bundle.discount_percent}% OFF</Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { if (confirm("Delete this bundle?")) deleteBundle.mutate(bundle.id); }}
                  className="self-center p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorBundleManager;
