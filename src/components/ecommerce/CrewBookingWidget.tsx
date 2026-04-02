import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Package {
  name: string;
  price?: number;
  base_price?: number;
  inclusions?: string[];
  deliverables?: string[];
}

interface CrewBookingWidgetProps {
  crewId: string;
  crewName: string;
  packages?: Package[];
  basePrice?: number;
}

const EVENT_TYPES = [
  "Wedding", "Birthday Party", "Corporate Event",
  "Anniversary", "Baby Shower", "Engagement",
  "Product Launch", "Conference", "Other",
];

const CrewBookingWidget = ({
  crewId,
  crewName,
  packages = [],
  basePrice = 0,
}: CrewBookingWidgetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calOpen, setCalOpen] = useState(false);

  const [form, setForm] = useState({
    eventType: "",
    eventDate: undefined as Date | undefined,
    duration: "",
    location: "",
    requirements: "",
    selectedPackageIdx: packages.length > 0 ? 0 : -1,
  });

  const selectedPackage =
    form.selectedPackageIdx >= 0 ? packages[form.selectedPackageIdx] : null;

  const packagePrice = selectedPackage
    ? (selectedPackage.base_price || selectedPackage.price || 0)
    : basePrice;

  const advanceAmount = Math.round(packagePrice * 0.25);

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleBook = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book this crew member.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!form.eventType || !form.eventDate || !form.location) {
      toast({
        title: "Missing details",
        description: "Please fill event type, date and location.",
        variant: "destructive",
      });
      return;
    }

    if (advanceAmount <= 0) {
      toast({
        title: "No price set",
        description: "This crew member hasn't set pricing yet. Please contact directly.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Payment gateway failed to load");

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { amount: advanceAmount * 100, receipt: `crew_${crewId}_${Date.now()}`.substring(0, 40) } }
      );
      if (orderError || !orderData?.id) throw new Error(orderError?.message || "Order creation failed");

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const rzp = new window.Razorpay({
        key: keyId,
        amount: orderData.amount,
        currency: "INR",
        name: "Evnting",
        description: `25% Advance — ${crewName}`,
        order_id: orderData.id,
        prefill: {
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
        },
        theme: { color: "#6366f1" },
        handler: async (response: any) => {
          try {
            const { error: insertError } = await supabase.from("service_orders").insert({
              title: `${form.eventType} — ${crewName}`,
              service_type: "crew",
              event_date: format(form.eventDate!, "yyyy-MM-dd"),
              location: form.location,
              notes: form.requirements,
              client_name: user.user_metadata?.full_name || "",
              client_email: user.email || "",
              status: "pending",
              service_details: {
                crew_id: crewId,
                crew_name: crewName,
                event_type: form.eventType,
                duration: form.duration,
                package: selectedPackage?.name || "Custom",
                total_price: packagePrice,
                advance_paid: advanceAmount,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              },
            });

            if (insertError) throw insertError;

            toast({
              title: "Booking confirmed!",
              description: `Advance of ₹${advanceAmount.toLocaleString()} paid. The crew will contact you shortly.`,
            });
            setOpen(false);
          } catch (err: any) {
            toast({
              title: "Payment recorded but booking failed",
              description: "Please contact support with your payment ID: " + response.razorpay_payment_id,
              variant: "destructive",
            });
          }
        },
      });

      rzp.open();
    } catch (err: any) {
      toast({
        title: "Booking failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full h-12 gap-2 text-sm">
          <Zap className="h-4 w-4" /> Book Now — Pay 25% Advance
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {crewName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Package selector */}
          {packages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary">
                Select Package
              </Label>
              <div className="grid gap-2">
                {packages.map((pkg, i) => {
                  const price = pkg.base_price || pkg.price || 0;
                  return (
                    <button
                      key={i}
                      onClick={() => setForm((f) => ({ ...f, selectedPackageIdx: i }))}
                      className={cn(
                        "text-left rounded-lg border p-3 transition-all",
                        form.selectedPackageIdx === i
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{pkg.name}</span>
                        {price > 0 && (
                          <span className="text-sm font-bold text-primary">
                            ₹{price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {(pkg.inclusions || pkg.deliverables) && (
                        <ul className="mt-1 space-y-0.5">
                          {(pkg.inclusions || pkg.deliverables || []).slice(0, 3).map((item, j) => (
                            <li key={j} className="text-[11px] text-muted-foreground">
                              ✓ {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Event type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary">
              Event Type
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.map((et) => (
                <Badge
                  key={et}
                  variant={form.eventType === et ? "default" : "outline"}
                  className="cursor-pointer text-xs py-1 px-2.5"
                  onClick={() => setForm((f) => ({ ...f, eventType: et }))}
                >
                  {et}
                </Badge>
              ))}
            </div>
          </div>

          {/* Event date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary">
              Event Date
            </Label>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-left hover:border-primary/50 transition-colors">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {form.eventDate ? format(form.eventDate, "PPP") : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.eventDate}
                  onSelect={(d) => { setForm((f) => ({ ...f, eventDate: d })); setCalOpen(false); }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-primary">
              Duration
            </Label>
            <Input
              id="duration"
              placeholder="e.g. 4 hours, Full day"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-primary">
              Event Location
            </Label>
            <Input
              id="location"
              placeholder="Venue name or address"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>

          {/* Special requirements */}
          <div className="space-y-1.5">
            <Label htmlFor="requirements" className="text-xs font-bold uppercase tracking-widest text-primary">
              Special Requirements
            </Label>
            <Textarea
              id="requirements"
              placeholder="Any specific shots, styles, dietary needs, setup requirements..."
              rows={3}
              value={form.requirements}
              onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
            />
          </div>

          {/* Price summary */}
          {packagePrice > 0 && (
            <div className="bg-muted/60 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Package total</span>
                <span>₹{packagePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground border-t border-border/60 pt-1.5">
                <span>Advance now (25%)</span>
                <span className="text-primary">₹{advanceAmount.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Remaining ₹{(packagePrice - advanceAmount).toLocaleString()} due on event day.
              </p>
            </div>
          )}

          <Button onClick={handleBook} disabled={loading} className="w-full h-11 gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Processing..." : `Pay ₹${advanceAmount.toLocaleString()} Advance`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrewBookingWidget;
