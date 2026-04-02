import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Building2, Package, Users, MapPin, IndianRupee, ShieldCheck,
  ArrowRight, ArrowLeft, CheckCircle2, Loader2, Upload, Truck, Sparkles,
} from "lucide-react";

const BUSINESS_TYPES = [
  { value: "equipment", label: "Equipment Rental", icon: Package },
  { value: "venue", label: "Venue", icon: Building2 },
  { value: "crew", label: "Crew & Services", icon: Users },
];

const VendorOnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch onboarding progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ["vendor-onboarding", user?.id],
    enabled: !!user,
    queryFn: async () => {
      let { data } = await supabase.from("vendor_onboarding_progress").select("*").eq("vendor_id", user!.id).maybeSingle();
      if (!data) {
        const { data: created } = await supabase.from("vendor_onboarding_progress").insert({ vendor_id: user!.id } as any).select().single();
        data = created;
      }
      return data;
    },
  });

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ["service-cities"],
    queryFn: async () => {
      const { data } = await supabase.from("service_cities").select("name, state").eq("is_active", true).order("display_order");
      return data || [];
    },
  });

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Business details
  const [biz, setBiz] = useState({ company_name: "", full_name: "", phone: "", gst_number: "", address: "", city: "", business_type: "" });

  // Step 2: Product count
  const [productCount, setProductCount] = useState(0);

  // Step 4: Bank details
  const [bank, setBank] = useState({ account_number: "", ifsc: "", holder_name: "" });

  // Step 5: Delivery
  const [delivery, setDelivery] = useState({ warehouse_address: "", delivery_radius: 25 });

  // Resume from last step
  useEffect(() => {
    if (!progress) return;
    if (progress.step_6_verification) { onComplete(); return; }
    if (progress.step_5_delivery_setup) setStep(6);
    else if (progress.step_4_bank_connected) setStep(5);
    else if (progress.step_3_pricing_set) setStep(4);
    else if (progress.step_2_products_added) setStep(3);
    else if (progress.step_1_business_details) setStep(2);
  }, [progress]);

  // Load existing profile data
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setBiz({
          company_name: data.company_name || "", full_name: data.full_name || "",
          phone: data.phone || "", gst_number: (data as any).gst_number || "",
          address: data.address || "", city: (data as any).city || "",
          business_type: "",
        });
      }
    });
    supabase.from("vendor_inventory").select("id", { count: "exact", head: true }).eq("vendor_id", user.id).then(({ count }) => setProductCount(count || 0));
  }, [user]);

  const updateProgress = async (stepKey: string, stepNum: number) => {
    await supabase.from("vendor_onboarding_progress").update({
      [stepKey]: true, current_step: stepNum + 1, updated_at: new Date().toISOString(),
    } as any).eq("vendor_id", user!.id);
    queryClient.invalidateQueries({ queryKey: ["vendor-onboarding"] });
  };

  const saveStep1 = async () => {
    setSaving(true);
    try {
      await supabase.from("profiles").update({
        company_name: biz.company_name, full_name: biz.full_name, phone: biz.phone,
        gst_number: biz.gst_number, address: biz.address, city: biz.city,
      } as any).eq("user_id", user!.id);
      await updateProgress("step_1_business_details", 1);
      setStep(2);
      toast({ title: "Business details saved!" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const saveStep2 = async () => {
    if (productCount < 1) { toast({ title: "Add at least 1 product to continue", variant: "destructive" }); return; }
    await updateProgress("step_2_products_added", 2);
    setStep(3);
  };

  const saveStep3 = async () => {
    await updateProgress("step_3_pricing_set", 3);
    setStep(4);
  };

  const saveStep4 = async () => {
    setSaving(true);
    try {
      await supabase.from("profiles").update({
        bank_details: { account_number: bank.account_number, ifsc: bank.ifsc, holder_name: bank.holder_name },
      } as any).eq("user_id", user!.id);
      await updateProgress("step_4_bank_connected", 4);
      setStep(biz.business_type === "venue" || biz.business_type === "crew" ? 6 : 5);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const saveStep5 = async () => {
    setSaving(true);
    try {
      await supabase.from("profiles").update({
        godown_address: delivery.warehouse_address, warehouse_pincode: delivery.warehouse_address.slice(-6),
      } as any).eq("user_id", user!.id);
      await updateProgress("step_5_delivery_setup", 5);
      setStep(6);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const submitForReview = async () => {
    setSaving(true);
    try {
      await supabase.from("vendor_onboarding_progress").update({
        step_6_verification: true, is_completed: true, completed_at: new Date().toISOString(),
      } as any).eq("vendor_id", user!.id);
      await supabase.from("profiles").update({ vendor_status: "pending" } as any).eq("user_id", user!.id);
      toast({ title: "Submitted for review!", description: "We'll verify your account within 24 hours." });
      onComplete();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const completedSteps = [
    progress?.step_1_business_details, progress?.step_2_products_added,
    progress?.step_3_pricing_set, progress?.step_4_bank_connected,
    progress?.step_5_delivery_setup, progress?.step_6_verification,
  ].filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <Badge className="bg-primary/10 text-primary mb-2 gap-1"><Sparkles className="h-3 w-3" />Setup Wizard</Badge>
        <h1 className="text-2xl font-bold text-foreground">Set Up Your Business</h1>
        <p className="text-sm text-muted-foreground">Step {step} of 6 — {completedSteps} completed</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {/* Step 1: Business Details */}
      {step === 1 && (
        <Card><CardContent className="p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Building2 className="h-5 w-5" />Business Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Business Name *</Label><Input value={biz.company_name} onChange={(e) => setBiz({ ...biz, company_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Owner Name *</Label><Input value={biz.full_name} onChange={(e) => setBiz({ ...biz, full_name: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Phone *</Label><Input value={biz.phone} onChange={(e) => setBiz({ ...biz, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">GST Number</Label><Input value={biz.gst_number} onChange={(e) => setBiz({ ...biz, gst_number: e.target.value.toUpperCase() })} maxLength={15} placeholder="22AAAAA0000A1Z5" /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Business Address *</Label><Textarea value={biz.address} onChange={(e) => setBiz({ ...biz, address: e.target.value })} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">City *</Label>
              <Select value={biz.city} onValueChange={(v) => setBiz({ ...biz, city: v })}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {cities.map((c: any) => <SelectItem key={c.name} value={c.name}>{c.name}, {c.state}</SelectItem>)}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Business Type *</Label>
              <Select value={biz.business_type} onValueChange={(v) => setBiz({ ...biz, business_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{BUSINESS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={saveStep1} disabled={!biz.company_name || !biz.full_name || !biz.phone || !biz.city || !biz.business_type || saving} className="w-full gap-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}Save & Continue
          </Button>
        </CardContent></Card>
      )}

      {/* Step 2: Add Products */}
      {step === 2 && (
        <Card><CardContent className="p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Package className="h-5 w-5" />Add Your Products</h2>
          <p className="text-sm text-muted-foreground">Add at least 1 product to your catalog. You can add more later from your dashboard.</p>
          <div className="bg-muted/50 rounded-xl p-6 text-center space-y-3">
            <p className="text-3xl font-bold text-foreground">{productCount}</p>
            <p className="text-sm text-muted-foreground">products added</p>
            <Button variant="outline" onClick={() => { toast({ title: "Use the Inventory tab", description: "Go to your dashboard Inventory tab to add products. Come back here when done." }); }}>
              <Upload className="h-4 w-4 mr-1" />Go to Inventory Manager
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { supabase.from("vendor_inventory").select("id", { count: "exact", head: true }).eq("vendor_id", user!.id).then(({ count }) => setProductCount(count || 0)); }}>
              Refresh Count
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
            <Button className="flex-1" onClick={saveStep2} disabled={productCount < 1}>Continue<ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </CardContent></Card>
      )}

      {/* Step 3: Pricing */}
      {step === 3 && (
        <Card><CardContent className="p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><IndianRupee className="h-5 w-5" />Confirm Your Pricing</h2>
          <p className="text-sm text-muted-foreground">Your products have been added. Review and confirm pricing from your Inventory Manager.</p>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">{productCount} products with pricing set</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
            <Button className="flex-1" onClick={saveStep3}>Looks Good<ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </CardContent></Card>
      )}

      {/* Step 4: Bank Account */}
      {step === 4 && (
        <Card><CardContent className="p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><IndianRupee className="h-5 w-5" />Bank Account</h2>
          <p className="text-sm text-muted-foreground">Payments will be transferred to this account via Razorpay.</p>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Account Holder Name</Label><Input value={bank.holder_name} onChange={(e) => setBank({ ...bank, holder_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Account Number</Label><Input value={bank.account_number} onChange={(e) => setBank({ ...bank, account_number: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">IFSC Code</Label><Input value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })} maxLength={11} placeholder="SBIN0001234" /></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
            <Button className="flex-1" onClick={saveStep4} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save & Continue
            </Button>
          </div>
        </CardContent></Card>
      )}

      {/* Step 5: Delivery (equipment only) */}
      {step === 5 && (
        <Card><CardContent className="p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Truck className="h-5 w-5" />Delivery Setup</h2>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Warehouse / Pickup Address</Label><Textarea value={delivery.warehouse_address} onChange={(e) => setDelivery({ ...delivery, warehouse_address: e.target.value })} rows={2} /></div>
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label className="text-xs">Delivery Radius</Label><span className="text-sm font-bold">{delivery.delivery_radius} km</span></div>
              <Input type="range" min={5} max={100} value={delivery.delivery_radius} onChange={(e) => setDelivery({ ...delivery, delivery_radius: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
            <Button className="flex-1" onClick={saveStep5} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save & Continue
            </Button>
          </div>
        </CardContent></Card>
      )}

      {/* Step 6: Review & Submit */}
      {step === 6 && (
        <Card><CardContent className="p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Review & Go Live</h2>
          <div className="space-y-2">
            {[
              { label: "Business Details", done: progress?.step_1_business_details },
              { label: "Products Added", done: progress?.step_2_products_added },
              { label: "Pricing Confirmed", done: progress?.step_3_pricing_set },
              { label: "Bank Account Connected", done: progress?.step_4_bank_connected },
              { label: "Delivery Setup", done: progress?.step_5_delivery_setup || biz.business_type !== "equipment" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
                <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
              </div>
            ))}
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">After submission, our team will verify your details within 24 hours. You'll be notified once approved.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(5)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
            <Button className="flex-1 gap-1" onClick={submitForReview} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}Submit for Review
            </Button>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
};

export default VendorOnboardingWizard;
