import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window { Razorpay: any }
}

interface SiteVisitFormProps {
  rental: any;
}

const SLOTS = [
  { value: "morning", label: "Morning", time: "8 AM – 2 PM" },
  { value: "evening", label: "Evening", time: "3 PM – 10 PM" },
  { value: "full_day", label: "Full Day", time: "8 AM – 10 PM" },
];

const SiteVisitForm = ({ rental }: SiteVisitFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [preferredDate, setPreferredDate] = useState<Date>();
  const [slot, setSlot] = useState("full_day");
  const [clientName, setClientName] = useState(user?.user_metadata?.full_name || "");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date();
  const depositAmount: number = rental?.site_visit_price ?? 499;

  const handleSiteVisit = async () => {
    if (!clientName.trim() || !clientPhone.trim() || !preferredDate) {
      toast({ title: "Required", description: "Please fill name, phone, and select a date.", variant: "destructive" });
      return;
    }

    if (!window.Razorpay) {
      toast({ title: "Payment unavailable", description: "Please refresh and try again", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order for deposit
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: depositAmount,
          currency: "INR",
          receipt: `sitevisit_${rental.id}`,
          notes: { venue_id: rental.id, client_phone: clientPhone },
        },
      });

      if (orderError || !orderData?.razorpay_order_id) {
        throw new Error(orderError?.message || "Could not create payment order");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: orderData.razorpay_order_id,
        name: "Evnting",
        description: `Site Visit Deposit – ${rental.title}`,
        image: "/favicon.ico",
        prefill: {
          name: clientName,
          email: clientEmail || undefined,
          contact: clientPhone,
        },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async (response: any) => {
          try {
            const { error } = await (supabase.from("site_visit_requests" as any) as any).insert({
              venue_id: rental.id,
              client_id: user?.id || null,
              client_name: clientName,
              client_phone: clientPhone,
              client_email: clientEmail || null,
              preferred_date: format(preferredDate, "yyyy-MM-dd"),
              preferred_slot: slot,
              deposit_amount: depositAmount,
              deposit_status: "paid",
              razorpay_payment_id: response.razorpay_payment_id,
            });

            if (error) throw error;

            toast({
              title: "Site Visit Booked! 🎉",
              description: "The venue owner will confirm your appointment shortly.",
            });
            setSubmitted(true);
          } catch (err: any) {
            toast({ title: "Booking Error", description: err.message, variant: "destructive" });
          } finally {
            setLoading(false);
          }
        },
      };

      new window.Razorpay(options).open();
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center space-y-2">
        <MapPin className="h-5 w-5 text-primary mx-auto" />
        <p className="text-sm font-semibold text-foreground">Site Visit Booked!</p>
        <p className="text-xs text-muted-foreground">₹{depositAmount} deposit paid. The venue owner will confirm your appointment shortly.</p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>Schedule Another</Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" /> Schedule Site Visit
      </h3>
      <p className="text-xs text-muted-foreground">
        Visit the venue in person. ₹{depositAmount} deposit is fully refundable or credited toward your booking.
      </p>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Preferred Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal h-10 text-xs", !preferredDate && "text-muted-foreground")}
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                {preferredDate ? format(preferredDate, "dd MMM yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={preferredDate}
                onSelect={setPreferredDate}
                disabled={(d) => d < today}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Preferred Slot</Label>
          <div className="grid grid-cols-3 gap-2">
            {SLOTS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSlot(s.value)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-center transition-all",
                  slot === s.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                <div className="text-xs font-medium">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.time}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Name *</Label>
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Your name"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Phone *</Label>
          <Input
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="email@example.com"
            className="h-9 text-sm"
          />
        </div>
      </div>

      <Button onClick={handleSiteVisit} className="w-full h-11" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Confirm Visit — ₹{depositAmount}
      </Button>
      <p className="text-[10px] text-muted-foreground text-center">
        100% credited toward booking, or refunded if you don't proceed
      </p>
    </div>
  );
};

export default SiteVisitForm;
