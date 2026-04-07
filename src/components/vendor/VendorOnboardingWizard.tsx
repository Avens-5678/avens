import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import confetti from "canvas-confetti";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Loader2, Phone,
  Package, Building2, Users, Tent, MapPin, Upload, X, Shield, FileText, Plus,
} from "lucide-react";
import MapPinPicker from "@/components/ecommerce/MapPinPicker";

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════

const TOTAL_STEPS = 7;

const VENDOR_TYPES = [
  { value: "equipment", label: "Equipment Rental", desc: "Tents, stages, lighting, furniture", icon: Package },
  { value: "venue", label: "Venue", desc: "Banquet halls, farmhouses, rooftops", icon: Building2 },
  { value: "crew", label: "Crew & Services", desc: "DJs, photographers, caterers, decorators", icon: Users },
  { value: "multiple", label: "Multiple", desc: "I offer more than one type", icon: Tent },
];

const CITIES = ["Hyderabad", "Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Other"];

const EXPERIENCE_OPTIONS = [
  { value: "active", label: "Yes, actively serving clients" },
  { value: "starting", label: "Just starting out" },
  { value: "planning", label: "Planning to start soon" },
];

const EQUIPMENT_CATEGORIES = [
  "Structures & Venues", "Stages & Platforms", "Lighting & Sound",
  "Furniture", "Climate Control", "Branding & Signage",
  "AV Equipment", "Power & Generators", "Décor", "Others",
];

const STOCK_VALUE_OPTIONS = [
  "Under ₹5 Lakhs", "₹5L – ₹20L", "₹20L – ₹1 Crore", "Above ₹1 Crore",
];

const VENUE_TYPES = [
  "Banquet Hall", "Farmhouse", "Rooftop", "Hotel",
  "Lawn", "Resort", "Convention Centre", "Club",
];

const VENUE_AMENITIES = [
  "Air Conditioning", "Parking", "In-house Catering", "Generator backup",
  "Décor allowed", "Outside food allowed", "Valet parking", "Bridal room",
];

const SERVICE_TYPES = [
  "Photography", "Videography", "DJ & Music", "Catering",
  "Decoration", "Event Management", "Makeup & Grooming",
  "Security", "Lighting", "Anchoring", "Others",
];

const TEAM_SIZE_OPTIONS = [
  "Just me", "2–5 people", "6–15 people", "16–50 people", "50+ people",
];

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface FormData {
  vendor_type: string;
  city: string;
  experience_level: string;
  phone: string;
  phone_verified: boolean;
  business_name: string;
  owner_name: string;
  email: string;
  whatsapp_number: string;
  categories: string[];
  years_in_business: string;
  description: string;
  approx_stock_value: string;
  venue_types: string[];
  max_capacity: string;
  num_spaces: string;
  amenities: string[];
  service_types: string[];
  team_size: string;
  passport_photo_url: string;
  shop_photo_url: string;
  photos: string[];
  documents: Record<string, string>;
  has_multiple_warehouses: boolean;
  warehouses: Array<{ name: string; address: string; lat: number | null; lng: number | null; pincode: string }>;
}

const INITIAL_FORM: FormData = {
  vendor_type: "", city: "", experience_level: "",
  phone: "", phone_verified: false,
  business_name: "", owner_name: "", email: "", whatsapp_number: "",
  categories: [], years_in_business: "", description: "",
  approx_stock_value: "", venue_types: [], max_capacity: "", num_spaces: "",
  amenities: [], service_types: [], team_size: "",
  passport_photo_url: "", shop_photo_url: "",
  photos: [], documents: {},
  has_multiple_warehouses: false,
  warehouses: [{ name: "", address: "", lat: null, lng: null, pincode: "" }],
};

// ═══════════════════════════════════════
// Reusable sub-components
// ═══════════════════════════════════════

const OptionCard = ({ selected, onClick, children, className = "" }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left border rounded-xl p-4 transition-all duration-200 ${
      selected
        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-500 ring-1 ring-indigo-600/20"
        : "border-border hover:border-indigo-400 bg-card"
    } ${className}`}
  >
    {children}
  </button>
);

const ChipToggle = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
      selected
        ? "bg-indigo-600 text-white border-indigo-600"
        : "bg-card text-foreground border-border hover:border-indigo-400"
    }`}
  >
    {label}
  </button>
);

const StepShell = ({ step, title, subtitle, onBack, children }: {
  step: number; title: string; subtitle: string; onBack?: () => void; children: React.ReactNode;
}) => (
  <div className="min-h-screen bg-background flex items-start justify-center px-4 py-8 sm:py-12">
    <div className="w-full max-w-[560px]">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, backgroundColor: "#4F46E5" }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right mb-6">Step {step} of {TOTAL_STEPS}</p>

      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
      )}

      {/* Title */}
      <h2 className="text-[22px] font-bold text-foreground leading-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-6">{subtitle}</p>

      {children}
    </div>
  </div>
);

// ═══════════════════════════════════════
// Main component
// ═══════════════════════════════════════

const VendorOnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // Ref for Step 3 inputs — avoids re-render on every keystroke
  const formDataRef = useRef<Record<string, string>>({});
  const syncTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const debouncedSync = useCallback(() => {
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      setFormData((prev) => ({ ...prev, ...formDataRef.current }));
    }, 400);
  }, []);

  // OTP state
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpLocked, setOtpLocked] = useState(false);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3 validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Success animation state
  const [showSuccess, setShowSuccess] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Step 5 state (must be at top level, not inside conditional)
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [uploadError, setUploadError] = useState("");

  // Step 7 state (must be at top level, not inside conditional)
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (partial: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...partial }));

  // ── Resume from Supabase ──
  useEffect(() => {
    if (!user) return;
    supabase
      .from("vendor_onboarding_progress")
      .select("current_step, onboarding_data")
      .eq("vendor_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.current_step && data.onboarding_data) {
          setCurrentStep(data.current_step);
          setFormData({ ...INITIAL_FORM, ...(data.onboarding_data as any) });
        }
      });
  }, [user]);

  // ── Save progress to Supabase ──
  const saveProgress = async (stepData: Partial<FormData>, nextStep: number) => {
    if (!user) return;
    setSaving(true);
    const merged = { ...formData, ...stepData };
    try {
      // Upsert onboarding progress
      const { error } = await supabase.from("vendor_onboarding_progress").upsert({
        vendor_id: user.id,
        current_step: nextStep,
        onboarding_data: merged as any,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "vendor_id" });
      if (error) throw error;
      setFormData(merged);
      setCurrentStep(nextStep);
    } catch (e: any) {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── OTP countdown ──
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  // ── OTP handlers ──
  const sendOtp = async () => {
    if (formData.phone.length !== 10) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: "+91" + formData.phone });
      if (error) throw error;
      setOtpSent(true);
      setOtpCountdown(30);
      setOtpError("");
      toast({ title: "OTP sent!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const verifyOtp = async () => {
    const token = otp.join("");
    if (token.length !== 6) return;
    if (otpLocked) {
      const remaining = lockoutEnd ? Math.ceil((lockoutEnd - Date.now()) / 1000) : 0;
      setOtpError(`Too many attempts. Try again in ${remaining}s`);
      return;
    }
    setOtpVerifying(true);
    setOtpError("");
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: "+91" + formData.phone, token, type: "sms" });
      if (error) {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);
        if (newAttempts >= 3) {
          setOtpLocked(true);
          const end = Date.now() + 5 * 60 * 1000;
          setLockoutEnd(end);
          setTimeout(() => { setOtpLocked(false); setOtpAttempts(0); setLockoutEnd(null); }, 5 * 60 * 1000);
          setOtpError("Too many failed attempts. Please wait 5 minutes.");
        } else if (error.message.includes("expired")) {
          setOtpError("OTP expired. Please request a new one.");
        } else {
          setOtpError(`Incorrect OTP. ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? "s" : ""} remaining.`);
        }
        return;
      }
      setOtpAttempts(0);
      update({ phone_verified: true });
      setPhoneVerified(true);
      setTimeout(() => {
        saveProgress({ phone_verified: true, whatsapp_number: formData.whatsapp_number || formData.phone }, 3);
      }, 1200);
    } catch (e: any) {
      setOtpError(e.message);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Step 3 validation ──
  const step3Errors: Record<string, string> = {};
  if (touched.business_name && formData.business_name.length < 3) step3Errors.business_name = "Min 3 characters";
  if (touched.owner_name && formData.owner_name.length < 2) step3Errors.owner_name = "Min 2 characters";
  if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) step3Errors.email = "Enter a valid email";
  if (touched.city && !formData.city) step3Errors.city = "Select your city";
  if (touched.whatsapp_number && formData.whatsapp_number.length !== 10) step3Errors.whatsapp_number = "Enter 10-digit number";

  const step3Valid =
    formData.business_name.length >= 3 &&
    formData.owner_name.length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    !!formData.city &&
    formData.whatsapp_number.length === 10;

  // ── Step 4 validation (dynamic) ──
  const step4Valid = (() => {
    const vt = formData.vendor_type;
    if (vt === "equipment") return formData.categories.length >= 1 && !!formData.approx_stock_value;
    if (vt === "venue") return formData.venue_types.length >= 1 && !!formData.max_capacity;
    if (vt === "crew") return formData.service_types.length >= 1 && !!formData.team_size;
    if (vt === "multiple") return formData.categories.length >= 1 || formData.service_types.length >= 1 || formData.venue_types.length >= 1;
    return false;
  })();

  // ── Step 1 eligibility ──
  const step1Done = !!formData.vendor_type && !!formData.city && !!formData.experience_level;

  useEffect(() => {
    if (step1Done && currentStep === 1 && !showSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        saveProgress({}, 2);
        setShowSuccess(false);
      }, 1800);
    }
  }, [step1Done]);

  // ═══════════════════════════════════════
  // STEP 1 — Eligibility
  // ═══════════════════════════════════════
  if (currentStep === 1) {
    return (
      <StepShell step={1} title="Let's see if you're a good fit" subtitle="3 quick questions — takes 30 seconds">
        {showSuccess ? (
          <div className="text-center py-12 space-y-3 animate-in zoom-in-50 duration-500">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Perfect! You're a great fit for Evnting</h3>
            <p className="text-sm text-muted-foreground">Join 200+ vendors already earning on the platform</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Q1 */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">What do you offer?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VENDOR_TYPES.map((t) => (
                  <OptionCard key={t.value} selected={formData.vendor_type === t.value} onClick={() => update({ vendor_type: t.value })}>
                    <div className="flex items-start gap-3">
                      <t.icon className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Which city are you based in?</p>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <ChipToggle key={c} label={c} selected={formData.city === c} onClick={() => update({ city: c })} />
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Are you currently serving events?</p>
              <div className="space-y-2">
                {EXPERIENCE_OPTIONS.map((o) => (
                  <OptionCard key={o.value} selected={formData.experience_level === o.value} onClick={() => update({ experience_level: o.value })}>
                    <p className="text-sm font-medium text-foreground">{o.label}</p>
                  </OptionCard>
                ))}
              </div>
            </div>
          </div>
        )}
      </StepShell>
    );
  }

  // ═══════════════════════════════════════
  // STEP 2 — Phone verification
  // ═══════════════════════════════════════
  if (currentStep === 2) {
    return (
      <StepShell step={2} title="Verify your phone number" subtitle="We'll send you an OTP to confirm" onBack={() => setCurrentStep(1)}>
        {phoneVerified || formData.phone_verified ? (
          <div className="text-center py-12 space-y-3 animate-in zoom-in-50 duration-500">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Phone verified</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Phone input */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Mobile Number</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 h-10 rounded-lg border border-border bg-muted/50 text-sm flex-shrink-0">
                  <span className="text-base">🇮🇳</span>
                  <span className="text-muted-foreground">+91</span>
                </div>
                <Input
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => update({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="98765 43210"
                  className="flex-1"
                  disabled={otpSent}
                />
              </div>
            </div>

            {!otpSent ? (
              <Button
                onClick={sendOtp}
                disabled={formData.phone.length !== 10 || saving}
                className="w-full gap-2"
                style={{ backgroundColor: "#4F46E5" }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                Send OTP
              </Button>
            ) : (
              <div className="space-y-4">
                {/* OTP boxes */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Enter 6-digit OTP</Label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-lg font-bold border border-border rounded-lg bg-card focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                      />
                    ))}
                  </div>
                  {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}
                </div>

                {/* Timer / Resend */}
                <div className="text-center">
                  {otpCountdown > 0 ? (
                    <p className="text-xs text-muted-foreground">Resend OTP in {otpCountdown}s</p>
                  ) : (
                    <button onClick={sendOtp} className="text-xs text-indigo-600 hover:underline font-medium">Resend OTP</button>
                  )}
                </div>

                <Button
                  onClick={verifyOtp}
                  disabled={otp.join("").length !== 6 || otpVerifying}
                  className="w-full gap-2"
                  style={{ backgroundColor: "#4F46E5" }}
                >
                  {otpVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Verify
                </Button>
              </div>
            )}

            {/* Skip for dev/testing */}
            <button
              onClick={() => {
                update({ phone_verified: true, whatsapp_number: formData.phone });
                saveProgress({ phone_verified: true, whatsapp_number: formData.phone || "0000000000" }, 3);
              }}
              className="text-xs text-muted-foreground hover:text-foreground text-center w-full"
            >
              Skip verification (testing only)
            </button>
          </div>
        )}
      </StepShell>
    );
  }

  // ═══════════════════════════════════════
  // STEP 3 — Basic information
  // ═══════════════════════════════════════
  if (currentStep === 3) {
    return (
      <StepShell step={3} title="Tell us about your business" subtitle="All fields are required" onBack={() => setCurrentStep(2)}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Business Name *</Label>
            <Input
              key="business_name"
              defaultValue={formData.business_name}
              onChange={(e) => { formDataRef.current.business_name = e.target.value; debouncedSync(); }}
              onBlur={(e) => { update({ business_name: e.target.value }); setTouched((t) => ({ ...t, business_name: true })); }}
              placeholder="e.g. Raj Event Solutions"
            />
            {step3Errors.business_name && <p className="text-xs text-red-500">{step3Errors.business_name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Owner Full Name *</Label>
            <Input
              key="owner_name"
              defaultValue={formData.owner_name}
              onChange={(e) => { formDataRef.current.owner_name = e.target.value; debouncedSync(); }}
              onBlur={(e) => { update({ owner_name: e.target.value }); setTouched((t) => ({ ...t, owner_name: true })); }}
              placeholder="Your full name"
            />
            {step3Errors.owner_name && <p className="text-xs text-red-500">{step3Errors.owner_name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email Address *</Label>
            <Input
              key="email"
              type="email"
              defaultValue={formData.email}
              onChange={(e) => { formDataRef.current.email = e.target.value; debouncedSync(); }}
              onBlur={(e) => { update({ email: e.target.value }); setTouched((t) => ({ ...t, email: true })); }}
              placeholder="you@company.com"
            />
            {step3Errors.email && <p className="text-xs text-red-500">{step3Errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">City *</Label>
            <select
              key="city"
              defaultValue={formData.city}
              onChange={(e) => { update({ city: e.target.value }); setTouched((t) => ({ ...t, city: true })); }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {step3Errors.city && <p className="text-xs text-red-500">{step3Errors.city}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">WhatsApp Number *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg viewBox="0 0 24 24" fill="#25D366" className="h-4 w-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.35 0-4.536-.685-6.38-1.864l-.446-.295-2.903.973.974-2.903-.295-.446A9.953 9.953 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
              </div>
              <Input
                key="whatsapp_number"
                defaultValue={formData.whatsapp_number}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); e.target.value = v; formDataRef.current.whatsapp_number = v; debouncedSync(); }}
                onBlur={(e) => { update({ whatsapp_number: e.target.value.replace(/\D/g, "").slice(0, 10) }); setTouched((t) => ({ ...t, whatsapp_number: true })); }}
                placeholder="10-digit number"
                className="pl-9"
                maxLength={10}
              />
            </div>
            {step3Errors.whatsapp_number && <p className="text-xs text-red-500">{step3Errors.whatsapp_number}</p>}
          </div>

          {/* ── Warehouses / Godowns ── */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <Label className="text-sm font-semibold">Godown / Warehouse</Label>
              <p className="text-xs text-muted-foreground">Where do you store your inventory? Use the map to pin the exact location.</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id="multi-wh"
                checked={formData.has_multiple_warehouses}
                onChange={(e) => update({
                  has_multiple_warehouses: e.target.checked,
                  warehouses: e.target.checked ? formData.warehouses : formData.warehouses.slice(0, 1),
                })}
              />
              <label htmlFor="multi-wh">I have multiple warehouses</label>
            </div>
            {formData.warehouses.map((wh, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Warehouse {idx + 1}{idx === 0 && " (Primary)"}</Label>
                  {idx > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      const next = formData.warehouses.filter((_, i) => i !== idx);
                      update({ warehouses: next });
                    }}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Godown name (e.g. Main Warehouse, Hi-Tech City Branch)"
                  value={wh.name}
                  onChange={(e) => {
                    const next = [...formData.warehouses];
                    next[idx] = { ...next[idx], name: e.target.value };
                    update({ warehouses: next });
                  }}
                />
                <MapPinPicker
                  compact
                  label=""
                  initialLat={wh.lat || undefined}
                  initialLng={wh.lng || undefined}
                  onLocationSelect={(lat, lng, address) => {
                    const next = [...formData.warehouses];
                    next[idx] = { ...next[idx], lat, lng, address: address || next[idx].address };
                    update({ warehouses: next });
                  }}
                />
              </div>
            ))}
            {formData.has_multiple_warehouses && (
              <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                update({ warehouses: [...formData.warehouses, { name: "", address: "", lat: null, lng: null, pincode: "" }] });
              }}>
                <Plus className="h-3 w-3" /> Add another warehouse
              </Button>
            )}
          </div>

          <Button
            onClick={() => {
              // Sync ref values to state before saving
              update({
                business_name: formDataRef.current.business_name || formData.business_name,
                owner_name: formDataRef.current.owner_name || formData.owner_name,
                email: formDataRef.current.email || formData.email,
                whatsapp_number: formDataRef.current.whatsapp_number || formData.whatsapp_number,
              });
              setTimeout(() => saveProgress({
                business_name: formDataRef.current.business_name || formData.business_name,
                owner_name: formDataRef.current.owner_name || formData.owner_name,
                email: formDataRef.current.email || formData.email,
                whatsapp_number: formDataRef.current.whatsapp_number || formData.whatsapp_number,
              }, 4), 0);
            }}
            disabled={!step3Valid || saving}
            className="w-full gap-2 mt-4"
            style={{ backgroundColor: step3Valid ? "#4F46E5" : undefined }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Continue
          </Button>
        </div>
      </StepShell>
    );
  }

  // ═══════════════════════════════════════
  // STEP 4 — Business details (dynamic)
  // ═══════════════════════════════════════
  if (currentStep === 4) {
    const vt = formData.vendor_type;
    const toggleArray = (key: keyof FormData, value: string) => {
      const arr = formData[key] as string[];
      update({ [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
    };

    return (
      <StepShell step={4} title="Tell us more about what you offer" subtitle="This helps customers find you faster" onBack={() => setCurrentStep(3)}>
        <div className="space-y-6">
          {/* Equipment categories */}
          {(vt === "equipment" || vt === "multiple") && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Categories {vt === "equipment" && <span className="text-red-500">*</span>}</p>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_CATEGORIES.map((c) => (
                  <ChipToggle key={c} label={c} selected={formData.categories.includes(c)} onClick={() => toggleArray("categories", c)} />
                ))}
              </div>
            </div>
          )}

          {/* Equipment stock value */}
          {(vt === "equipment" || vt === "multiple") && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Approximate stock value {vt === "equipment" && <span className="text-red-500">*</span>}</p>
              <div className="grid grid-cols-2 gap-2">
                {STOCK_VALUE_OPTIONS.map((o) => (
                  <OptionCard key={o} selected={formData.approx_stock_value === o} onClick={() => update({ approx_stock_value: o })} className="py-3 text-center">
                    <p className="text-sm font-medium">{o}</p>
                  </OptionCard>
                ))}
              </div>
            </div>
          )}

          {/* Equipment / Crew years */}
          {(vt === "equipment" || vt === "crew" || vt === "multiple") && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{vt === "crew" ? "Years of experience" : "Years in business"}</Label>
              <Input
                type="number" min={0} max={50}
                value={formData.years_in_business}
                onChange={(e) => update({ years_in_business: e.target.value })}
                placeholder="e.g. 5"
                className="w-32"
              />
            </div>
          )}

          {/* Venue types */}
          {(vt === "venue" || vt === "multiple") && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Venue type {vt === "venue" && <span className="text-red-500">*</span>}</p>
              <div className="flex flex-wrap gap-2">
                {VENUE_TYPES.map((t) => (
                  <ChipToggle key={t} label={t} selected={formData.venue_types.includes(t)} onClick={() => toggleArray("venue_types", t)} />
                ))}
              </div>
            </div>
          )}

          {/* Venue capacity + spaces */}
          {(vt === "venue" || vt === "multiple") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Maximum capacity {vt === "venue" && <span className="text-red-500">*</span>}</Label>
                <Input type="number" min={0} value={formData.max_capacity} onChange={(e) => update({ max_capacity: e.target.value })} placeholder="e.g. 500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Number of halls/spaces</Label>
                <Input type="number" min={0} value={formData.num_spaces} onChange={(e) => update({ num_spaces: e.target.value })} placeholder="e.g. 3" />
              </div>
            </div>
          )}

          {/* Venue amenities */}
          {(vt === "venue" || vt === "multiple") && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Amenities</p>
              <div className="grid grid-cols-2 gap-2">
                {VENUE_AMENITIES.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(a)}
                      onChange={() => toggleArray("amenities", a)}
                      className="rounded border-border"
                    />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Service types */}
          {(vt === "crew" || vt === "multiple") && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Service types {vt === "crew" && <span className="text-red-500">*</span>}</p>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPES.map((s) => (
                  <ChipToggle key={s} label={s} selected={formData.service_types.includes(s)} onClick={() => toggleArray("service_types", s)} />
                ))}
              </div>
            </div>
          )}

          {/* Crew team size */}
          {(vt === "crew" || vt === "multiple") && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Team size {vt === "crew" && <span className="text-red-500">*</span>}</p>
              <div className="flex flex-wrap gap-2">
                {TEAM_SIZE_OPTIONS.map((o) => (
                  <ChipToggle key={o} label={o} selected={formData.team_size === o} onClick={() => update({ team_size: o })} />
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => saveProgress({}, 5)}
            disabled={!step4Valid || saving}
            className="w-full gap-2"
            style={{ backgroundColor: step4Valid ? "#4F46E5" : undefined }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Continue
          </Button>
        </div>
      </StepShell>
    );
  }

  // ═══════════════════════════════════════
  // STEP 5 — Photos (with real upload)
  // ═══════════════════════════════════════
  if (currentStep === 5) {
    const uploadSlotPhoto = async (slotKey: "passport" | "shop", file: File) => {
      if (!user) return;
      const maxSize = slotKey === "passport" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) { toast({ title: "File too large", description: `Max ${slotKey === "passport" ? "2" : "5"}MB.`, variant: "destructive" }); return; }
      if (!file.type.startsWith("image/")) { toast({ title: "Only image files allowed", variant: "destructive" }); return; }

      const fieldKey = slotKey === "passport" ? "passport_photo_url" : "shop_photo_url";
      setUploading((prev) => ({ ...prev, [slotKey]: 0 }));

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
      const path = `${user.id}/${slotKey}/${fileName}`;
      const { data, error } = await supabase.storage.from("vendor-photos").upload(path, file, { upsert: true });
      setUploading((prev) => { const n = { ...prev }; delete n[slotKey]; return n; });

      if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
      const { data: urlData } = supabase.storage.from("vendor-photos").getPublicUrl(data.path);
      update({ [fieldKey]: urlData.publicUrl });
    };

    const bothUploaded = !!formData.passport_photo_url && !!formData.shop_photo_url;

    return (
      <StepShell step={5} title="Upload your photos" subtitle="Two required photos for verification" onBack={() => setCurrentStep(4)}>
        <div className="space-y-6">
          {/* Slot 1 — Passport photo */}
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-indigo-600"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Your passport size photo <span className="text-red-500">*</span></p>
                <p className="text-[11px] text-muted-foreground">Clear face photo, plain background</p>
              </div>
            </div>
            {formData.passport_photo_url ? (
              <div className="flex items-center gap-3">
                <img src={formData.passport_photo_url} alt="Passport" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Uploaded</span>
                  <button onClick={() => update({ passport_photo_url: "" })} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              </div>
            ) : uploading["passport"] !== undefined ? (
              <div className="flex items-center gap-3 py-2"><Loader2 className="h-5 w-5 animate-spin text-indigo-500" /><span className="text-xs text-muted-foreground">Uploading...</span></div>
            ) : (
              <label className="block border border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadSlotPhoto("passport", e.target.files[0]); }} />
                <p className="text-xs text-muted-foreground"><span className="text-indigo-600 font-medium">Click to upload</span> — JPG, PNG (max 2MB)</p>
              </label>
            )}
          </div>

          {/* Slot 2 — Shop/warehouse photo */}
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Your shop or warehouse photo <span className="text-red-500">*</span></p>
                <p className="text-[11px] text-muted-foreground">Clear photo of your business premises</p>
              </div>
            </div>
            {formData.shop_photo_url ? (
              <div className="flex items-center gap-3">
                <img src={formData.shop_photo_url} alt="Shop" className="w-20 h-14 rounded-lg object-cover border" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Uploaded</span>
                  <button onClick={() => update({ shop_photo_url: "" })} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              </div>
            ) : uploading["shop"] !== undefined ? (
              <div className="flex items-center gap-3 py-2"><Loader2 className="h-5 w-5 animate-spin text-indigo-500" /><span className="text-xs text-muted-foreground">Uploading...</span></div>
            ) : (
              <label className="block border border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadSlotPhoto("shop", e.target.files[0]); }} />
                <p className="text-xs text-muted-foreground"><span className="text-indigo-600 font-medium">Click to upload</span> — JPG, PNG, WebP (max 5MB)</p>
              </label>
            )}
          </div>

          {bothUploaded && (
            <p className="text-sm text-emerald-600 font-medium text-center">Verified photos increase customer trust and booking rates</p>
          )}

          <Button
            onClick={() => saveProgress({}, 6)}
            disabled={!bothUploaded || saving}
            className="w-full gap-2"
            style={{ backgroundColor: bothUploaded ? "#4F46E5" : undefined }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Continue
          </Button>
          {!bothUploaded && (
            <p className="text-xs text-muted-foreground text-center">Both photos are required to continue</p>
          )}
        </div>
      </StepShell>
    );
  }

  // ═══════════════════════════════════════
  // STEP 6 — Documents (Aadhaar + PAN required, GST optional)
  // ═══════════════════════════════════════
  if (currentStep === 6) {
    const docSlots: { key: string; label: string; badge: "Required" | "Optional"; hint?: string }[] = [
      { key: "aadhaar", label: "Aadhaar Card", badge: "Required" },
      { key: "pan", label: "PAN Card", badge: "Required" },
      { key: "gst", label: "GST Certificate", badge: "Optional", hint: "Required only if your annual turnover exceeds \u20B920 lakhs" },
    ];

    const handleDocUpload = async (docKey: string, file: File) => {
      if (!user) return;
      if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5MB per document.", variant: "destructive" }); return; }
      const folder = `${user.id}/${docKey}`;
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
      const { data, error } = await supabase.storage.from("vendor-documents").upload(`${folder}/${fileName}`, file, { upsert: true });
      if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
      const { data: urlData } = supabase.storage.from("vendor-documents").getPublicUrl(data.path);
      update({ documents: { ...formData.documents, [docKey]: urlData.publicUrl } });
    };

    const removeDoc = (docKey: string) => {
      const next = { ...formData.documents };
      delete next[docKey];
      update({ documents: next });
    };

    const canProceed = !!formData.documents.aadhaar && !!formData.documents.pan;

    return (
      <StepShell step={6} title="Upload documents" subtitle="Aadhaar and PAN are required for verification" onBack={() => setCurrentStep(5)}>
        <div className="space-y-5">
          {/* Trust message */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">Your documents are encrypted and stored securely. Only used for verification.</p>
          </div>

          {docSlots.map((doc) => (
            <div key={doc.key} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{doc.label}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${doc.badge === "Required" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
                  {doc.badge}
                </span>
              </div>
              {doc.hint && <p className="text-[11px] text-muted-foreground -mt-1">{doc.hint}</p>}

              {formData.documents[doc.key] ? (
                <div className="flex items-center justify-between py-2 px-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />Uploaded
                  </span>
                  <button onClick={() => removeDoc(doc.key)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ) : (
                <label className="block border border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors" style={{ minHeight: 60 }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleDocUpload(doc.key, e.target.files[0]); }}
                  />
                  <p className="text-xs text-muted-foreground">Click to upload — PDF, JPG, PNG (max 5MB)</p>
                </label>
              )}
            </div>
          ))}

          <Button
            onClick={() => saveProgress({}, 7)}
            disabled={!canProceed || saving}
            className="w-full gap-2 mt-2"
            style={{ backgroundColor: canProceed ? "#4F46E5" : undefined }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Continue
          </Button>
          {!canProceed && (
            <p className="text-xs text-muted-foreground text-center">Aadhaar and PAN are required to continue</p>
          )}
        </div>
      </StepShell>
    );
  }

  // ═══════════════════════════════════════
  // STEP 7 — Review & Submit
  // ═══════════════════════════════════════
  if (currentStep === 7) {
    const submitForReview = async () => {
      setSaving(true);
      try {
        // Write business details to profiles
        const primary = formData.warehouses[0];
        await supabase.from("profiles").upsert({
          user_id: user!.id,
          company_name: formData.business_name,
          full_name: formData.owner_name,
          phone: formData.phone,
          city: formData.city,
          address: formData.city,
          vendor_status: "pending",
          godown_address: primary?.address || null,
          warehouse_lat: primary?.lat || null,
          warehouse_lng: primary?.lng || null,
        } as any, { onConflict: "user_id" });

        // Insert warehouses
        const validWh = formData.warehouses.filter((w) => w.name && w.lat && w.lng);
        if (validWh.length > 0) {
          await (supabase.from as any)("vendor_warehouses").insert(
            validWh.map((w, i) => ({
              vendor_id: user!.id,
              name: w.name,
              address: w.address || "",
              lat: w.lat,
              lng: w.lng,
              pincode: w.pincode || null,
              is_primary: i === 0,
            }))
          );
        }

        // Auto-create approved service_access rows based on selected vendor type
        const services: string[] = [];
        if (formData.vendor_type === "equipment") services.push("rental");
        else if (formData.vendor_type === "venue") services.push("venue");
        else if (formData.vendor_type === "crew") services.push("crew");
        else if (formData.vendor_type === "multiple") services.push("rental", "venue", "crew");
        if (services.length > 0) {
          await (supabase.from as any)("vendor_service_access").upsert(
            services.map((s) => ({ vendor_id: user!.id, service: s, status: "approved" })),
            { onConflict: "vendor_id,service" }
          );
        }

        // Mark onboarding complete
        await supabase.from("vendor_onboarding_progress").update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          current_step: 7,
          onboarding_data: formData as any,
        } as any).eq("vendor_id", user!.id);

        setSubmitted(true);
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 }, colors: ["#4F46E5", "#F97316", "#10B981", "#EAB308"] });
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally {
        setSaving(false);
      }
    };

    // ── SUCCESS SCREEN ──
    if (submitted) {
      const shareText = encodeURIComponent("I just joined Evnting — the best platform for event rentals in India! evnting.com");
      return (
        <div className="min-h-screen bg-background flex items-start justify-center px-4 py-12">
          <div className="w-full max-w-[560px] text-center space-y-8">
            {/* Animated checkmark */}
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto" style={{ animation: "successPop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <style>{`@keyframes successPop { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }`}</style>

            <div>
              <h2 className="text-[28px] font-bold text-foreground">Application Submitted!</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                We'll review your application and get back to you within 24-48 hours via WhatsApp and email.
              </p>
            </div>

            {/* Timeline */}
            <div className="text-left space-y-0">
              {[
                { num: "1", title: "Application review", desc: "Our team verifies your details and documents — usually within 24–48 hours" },
                { num: "2", title: "Approval notification", desc: "You'll get a WhatsApp message and email with your approval status" },
                { num: "3", title: "Go live and earn", desc: "Add bank account, create your first listing, and start getting bookings" },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.num}
                    </div>
                    {i < 2 && <div className="w-px h-8 bg-border" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <Button onClick={onComplete} className="w-full gap-2" style={{ backgroundColor: "#4F46E5" }}>
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.open(`https://wa.me/?text=${shareText}`, "_blank")}
              >
                <svg viewBox="0 0 24 24" fill="#25D366" className="h-4 w-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.35 0-4.536-.685-6.38-1.864l-.446-.295-2.903.973.974-2.903-.295-.446A9.953 9.953 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                Share Evnting with a friend
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // ── REVIEW FORM ──
    return (
      <StepShell step={7} title="Almost there! Review your application" subtitle="Make sure everything is correct before submitting" onBack={() => setCurrentStep(6)}>
        <div className="space-y-5">
          {/* Section: Business */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Business</p>
              <button onClick={() => setCurrentStep(3)} className="text-xs text-indigo-600 hover:underline font-medium">Edit</button>
            </div>
            <div className="divide-y divide-border">
              {[
                ["Business name", formData.business_name],
                ["Owner", formData.owner_name],
                ["Email", formData.email],
                ["City", formData.city],
                ["WhatsApp", "+91 " + formData.whatsapp_number],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground truncate max-w-[55%] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: What you offer */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What you offer</p>
              <button onClick={() => setCurrentStep(4)} className="text-xs text-indigo-600 hover:underline font-medium">Edit</button>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-sm font-medium text-foreground">{VENDOR_TYPES.find((t) => t.value === formData.vendor_type)?.label}</span>
              </div>
              {(formData.categories.length > 0 || formData.service_types.length > 0 || formData.venue_types.length > 0) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[...formData.categories, ...formData.service_types, ...formData.venue_types].map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-[10px] rounded">{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section: Photos */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Photos</p>
              <button onClick={() => setCurrentStep(5)} className="text-xs text-indigo-600 hover:underline font-medium">Edit</button>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-3">
                {formData.passport_photo_url ? (
                  <><img src={formData.passport_photo_url} alt="" className="w-10 h-10 rounded-full object-cover border" /><span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Passport photo</span></>
                ) : (
                  <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" />Passport photo missing</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {formData.shop_photo_url ? (
                  <><img src={formData.shop_photo_url} alt="" className="rounded-md object-cover border" style={{ width: 60, height: 40 }} /><span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Shop photo</span></>
                ) : (
                  <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" />Shop photo missing</span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Documents */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documents</p>
              <button onClick={() => setCurrentStep(6)} className="text-xs text-indigo-600 hover:underline font-medium">Edit</button>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                {formData.documents.aadhaar ? (
                  <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Aadhaar uploaded</span>
                ) : (
                  <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" />Aadhaar missing</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {formData.documents.pan ? (
                  <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />PAN uploaded</span>
                ) : (
                  <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" />PAN missing</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {formData.documents.gst ? (
                  <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />GST uploaded</span>
                ) : (
                  <span className="text-xs text-muted-foreground">GST: Not provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Missing docs warning */}
          {(!formData.documents.aadhaar || !formData.documents.pan) && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                Aadhaar and PAN are required to complete your application. Please go back and upload them.
              </p>
            </div>
          )}

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="rounded border-border mt-0.5"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              I agree to Evnting's <a href="/terms-of-service" target="_blank" className="text-indigo-600 hover:underline">Terms of Service</a> and Vendor Agreement
            </span>
          </label>

          <Button
            onClick={submitForReview}
            disabled={!termsAccepted || !formData.documents.aadhaar || !formData.documents.pan || saving}
            className="w-full gap-2 text-base"
            style={{ backgroundColor: termsAccepted && formData.documents.aadhaar && formData.documents.pan ? "#4F46E5" : undefined, height: 52 }}
          >
            {saving ? <><Loader2 className="h-5 w-5 animate-spin" />Submitting your application...</> : <><CheckCircle2 className="h-5 w-5" />Submit Application</>}
          </Button>
        </div>
      </StepShell>
    );
  }

  return null;
};

export default VendorOnboardingWizard;
