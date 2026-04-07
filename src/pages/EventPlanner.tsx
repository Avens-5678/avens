import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCart, CartItem } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon, Users, MapPin, Sparkles, ArrowRight, ArrowLeft,
  Loader2, ShoppingCart, Package, Building2, Camera, Music,
  CheckCircle2, Star, Zap,
} from "lucide-react";
import { format } from "date-fns";

// ── Types ──
interface PackageItem {
  id: string;
  name: string;
  quantity?: number;
  price_per_unit?: number;
  price?: number;
  total?: number;
}

interface GeneratedPackage {
  name: string;
  tier: string;
  venue: PackageItem | null;
  equipment: PackageItem[];
  crew: PackageItem[];
  total_cost: number;
  description: string;
}

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding", icon: "💍" },
  { value: "corporate", label: "Corporate Event", icon: "🏢" },
  { value: "birthday", label: "Birthday Party", icon: "🎂" },
  { value: "engagement", label: "Engagement", icon: "💝" },
  { value: "reception", label: "Reception", icon: "🥂" },
  { value: "festival", label: "Festival / Puja", icon: "🪔" },
  { value: "other", label: "Other", icon: "🎪" },
];

const VIBES = [
  { value: "elegant", label: "Elegant", icon: "✨" },
  { value: "casual", label: "Casual & Fun", icon: "🎉" },
  { value: "traditional", label: "Traditional", icon: "🪷" },
  { value: "modern", label: "Modern Minimal", icon: "🔲" },
  { value: "luxury", label: "Grand Luxury", icon: "👑" },
];

const QUICK_CHIPS = ["Outdoor", "Indoor", "Live music", "Photography essential", "Catering needed", "Decor important"];

const LOADING_MESSAGES = [
  "Finding the perfect venues...",
  "Matching you with top-rated vendors...",
  "Crafting your dream event...",
  "Calculating the best value packages...",
];

const TIER_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  budget: { bg: "bg-emerald-50 dark:bg-emerald-900/10", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 text-emerald-700" },
  standard: { bg: "bg-blue-50 dark:bg-blue-900/10", border: "border-blue-200 dark:border-blue-800", badge: "bg-blue-100 text-blue-700" },
  premium: { bg: "bg-purple-50 dark:bg-purple-900/10", border: "border-purple-200 dark:border-purple-800", badge: "bg-purple-100 text-purple-700" },
};

const EventPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [packages, setPackages] = useState<GeneratedPackage[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);

  // Brief form state
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [guestCount, setGuestCount] = useState(100);
  const [city, setCity] = useState("Hyderabad");
  const [budgetRange, setBudgetRange] = useState([50000, 300000]);
  const [vibes, setVibes] = useState<string[]>([]);
  const [requirements, setRequirements] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  const toggleVibe = (v: string) => setVibes((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  const toggleChip = (c: string) => setChips((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);

  // Loading message rotation
  const startLoadingMessages = () => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(i);
    }, 2500);
    return interval;
  };

  const handleGenerate = async () => {
    if (!user) { navigate("/auth?redirect=/event-planner"); return; }
    if (!eventType || !eventDate || !city) {
      toast({ title: "Please complete all required fields", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setLoadingMsg(0);
    const msgInterval = startLoadingMessages();

    try {
      // Create event_plans row
      const { data: plan, error: planError } = await supabase.from("event_plans").insert({
        customer_id: user.id,
        event_type: eventType,
        event_date: format(eventDate, "yyyy-MM-dd"),
        guest_count: guestCount,
        city,
        budget_min: budgetRange[0],
        budget_max: budgetRange[1],
        vibe: vibes.join(", "),
        special_requirements: [requirements, ...chips].filter(Boolean).join(". "),
        status: "generating",
      } as any).select("id").single();

      if (planError) throw planError;
      setPlanId(plan.id);

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke("generate-event-plan", {
        body: {
          event_type: eventType,
          event_date: format(eventDate, "yyyy-MM-dd"),
          guest_count: guestCount,
          city,
          budget_min: budgetRange[0],
          budget_max: budgetRange[1],
          vibe: vibes.join(", "),
          special_requirements: [requirements, ...chips].filter(Boolean).join(". "),
          plan_id: plan.id,
        },
      });

      if (error) throw error;
      if (data?.packages) {
        setPackages(data.packages);
        setStep(6);
      } else {
        throw new Error("No packages generated");
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      clearInterval(msgInterval);
      setGenerating(false);
    }
  };

  const bookPackage = async (pkg: GeneratedPackage, index: number) => {
    clearCart();
    const dateStr = eventDate ? format(eventDate, "yyyy-MM-dd") : undefined;

    // Add venue
    if (pkg.venue) {
      addItem({
        id: pkg.venue.id, title: pkg.venue.name, price_value: pkg.venue.price || 0,
        pricing_unit: "Per Day", quantity: 1, service_type: "venue",
        booking_from: dateStr, booking_till: dateStr,
      });
    }

    // Add equipment
    for (const eq of pkg.equipment) {
      addItem({
        id: eq.id, title: eq.name, price_value: eq.price_per_unit || eq.price || 0,
        pricing_unit: "Per Day", quantity: eq.quantity || 1, service_type: "rental",
        booking_from: dateStr, booking_till: dateStr,
      });
    }

    // Add crew
    for (const cr of pkg.crew) {
      addItem({
        id: cr.id, title: cr.name, price_value: cr.price || 0,
        pricing_unit: "Per Event", quantity: 1, service_type: "crew",
        booking_from: dateStr, booking_till: dateStr,
      });
    }

    // Mark plan as booked
    if (planId) {
      await supabase.from("event_plans").update({ selected_package_index: index, status: "booked" } as any).eq("id", planId);
    }

    toast({ title: "Event package added to cart!", description: `${pkg.name} — ₹${Math.round(pkg.total_cost).toLocaleString("en-IN")}` });
    navigate("/cart");
  };

  // ── Render ──
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8 max-w-3xl">

        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary mb-3 gap-1"><Sparkles className="h-3 w-3" />AI-Powered</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Plan Your Perfect Event</h1>
          <p className="text-sm text-muted-foreground mt-1">Tell us about your event. Our AI creates 3 ready-to-book packages in 30 seconds.</p>
        </div>

        {/* Progress */}
        {step < 6 && (
          <div className="flex items-center justify-center gap-1 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? "w-10 bg-primary" : "w-6 bg-muted"}`} />
            ))}
          </div>
        )}

        {/* ── Step 1: Event Type ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">What are you celebrating?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {EVENT_TYPES.map((et) => (
                <button
                  key={et.value}
                  onClick={() => { setEventType(et.value); setStep(2); }}
                  className={`p-4 rounded-xl border-2 text-center transition-all hover:shadow-md ${eventType === et.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                >
                  <span className="text-2xl block mb-1">{et.icon}</span>
                  <span className="text-xs font-medium text-foreground">{et.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Basics ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Tell us the basics</h2>
            <div className="space-y-1.5">
              <Label className="text-xs">Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, "dd MMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={eventDate} onSelect={setEventDate} disabled={(d) => d < new Date()} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><Label className="text-xs">Guest Count</Label><span className="text-sm font-bold text-foreground">{guestCount}</span></div>
              <Slider value={[guestCount]} onValueChange={([v]) => setGuestCount(v)} min={10} max={1000} step={10} />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>10</span><span>1000+</span></div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">City *</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Hyderabad" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button className="flex-1" onClick={() => setStep(3)} disabled={!eventDate || !city}><ArrowRight className="h-4 w-4 mr-1" />Next</Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Budget ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">What's your budget?</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>₹{budgetRange[0].toLocaleString("en-IN")}</span>
                <span className="font-bold">₹{budgetRange[1].toLocaleString("en-IN")}</span>
              </div>
              <Slider value={budgetRange} onValueChange={setBudgetRange} min={10000} max={5000000} step={10000} />
            </div>
            <div className="flex flex-wrap gap-2">
              {[["Under ₹50K", 10000, 50000], ["₹50K-2L", 50000, 200000], ["₹2L-5L", 200000, 500000], ["₹5L-10L", 500000, 1000000], ["₹10L+", 1000000, 5000000]].map(([label, min, max]) => (
                <Button key={label as string} variant="outline" size="sm" className="text-xs" onClick={() => setBudgetRange([min as number, max as number])}>{label as string}</Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button className="flex-1" onClick={() => setStep(4)}>Next<ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Vibe ── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">What vibe are you going for?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {VIBES.map((v) => (
                <button key={v.value} onClick={() => toggleVibe(v.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${vibes.includes(v.value) ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  <span className="text-xl block mb-0.5">{v.icon}</span>
                  <span className="text-[10px] font-medium text-foreground">{v.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button className="flex-1" onClick={() => setStep(5)}>Next<ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {/* ── Step 5: Requirements + Generate ── */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Anything specific?</h2>
            <div className="flex flex-wrap gap-2">
              {QUICK_CHIPS.map((c) => (
                <button key={c} onClick={() => toggleChip(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${chips.includes(c) ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/40"}`}>
                  {c}
                </button>
              ))}
            </div>
            <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Any special requirements, themes, or preferences..." rows={3} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button className="flex-1 gap-2" size="lg" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? LOADING_MESSAGES[loadingMsg] : "Plan My Event"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 6: Results ── */}
        {step === 6 && packages.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <h2 className="text-lg font-bold text-foreground">Your Event Packages</h2>
              <p className="text-sm text-muted-foreground">3 packages tailored to your {eventType} event. Pick one and book!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {packages.map((pkg, i) => {
                const colors = TIER_COLORS[pkg.tier] || TIER_COLORS.standard;
                return (
                  <Card key={i} className={`${colors.bg} ${colors.border} border-2 hover:shadow-lg transition-all`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="text-center">
                        <Badge className={`${colors.badge} text-[10px] mb-1`}>{pkg.tier}</Badge>
                        <h3 className="text-base font-bold text-foreground">{pkg.name}</h3>
                        <p className="text-2xl font-bold text-foreground mt-1">₹{Math.round(pkg.total_cost).toLocaleString("en-IN")}</p>
                      </div>

                      <Separator />

                      {pkg.venue && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Building2 className="h-3 w-3" />Venue</p>
                          <p className="text-xs text-foreground">{pkg.venue.name}</p>
                          <p className="text-[10px] text-muted-foreground">₹{Math.round(pkg.venue.price || 0).toLocaleString("en-IN")}</p>
                        </div>
                      )}

                      {pkg.equipment.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Package className="h-3 w-3" />Equipment</p>
                          {pkg.equipment.slice(0, 4).map((eq, j) => (
                            <p key={j} className="text-xs text-foreground">{eq.quantity ? `${eq.quantity} × ` : ""}{eq.name}</p>
                          ))}
                          {pkg.equipment.length > 4 && <p className="text-[10px] text-muted-foreground">+{pkg.equipment.length - 4} more</p>}
                        </div>
                      )}

                      {pkg.crew.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Crew</p>
                          {pkg.crew.map((cr, j) => <p key={j} className="text-xs text-foreground">{cr.name}</p>)}
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground italic">{pkg.description}</p>

                      <Button className="w-full gap-1.5" size="sm" onClick={() => bookPackage(pkg, i)}>
                        <ShoppingCart className="h-3.5 w-3.5" />Book This Package
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={() => { setStep(1); setPackages([]); }}>
                <ArrowLeft className="h-4 w-4 mr-1" />Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventPlanner;
