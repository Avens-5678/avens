import { useState, useMemo } from "react";
import { format, differenceInDays, addDays } from "date-fns";
import { CalendarIcon, Clock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAvailability } from "@/hooks/useAvailability";
import { useReservationHold } from "@/hooks/useReservationHold";
import { useCreateRentalOrder } from "@/hooks/useRentalOrders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BookingWidgetProps {
  rental: any;
  selectedVariant?: any;
}

const SLOTS = [
  { value: "morning", label: "Morning", time: "8 AM – 2 PM" },
  { value: "evening", label: "Evening", time: "3 PM – 10 PM" },
  { value: "full_day", label: "Full Day", time: "8 AM – 10 PM" },
];

const BookingWidget = ({ rental, selectedVariant }: BookingWidgetProps) => {
  const { toast } = useToast();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [slot, setSlot] = useState("full_day");
  const [step, setStep] = useState<"dates" | "details" | "countdown">("dates");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const checkInStr = checkIn ? format(checkIn, "yyyy-MM-dd") : undefined;
  const checkOutStr = checkOut ? format(checkOut, "yyyy-MM-dd") : undefined;

  const { data: availability, isLoading: availLoading } = useAvailability(
    rental.id,
    checkInStr,
    checkOutStr,
    slot
  );

  const {
    hold,
    loading: holdLoading,
    timeLeft,
    createHold,
    confirmHold,
    cancelHold,
    clearHold,
    isExpired,
    isHeld,
    isConfirmed,
  } = useReservationHold();

  const createOrder = useCreateRentalOrder();

  const today = new Date();
  const isVenue = (rental.service_type || "rental") === "venue";
  const numDays = checkIn && checkOut ? Math.max(differenceInDays(checkOut, checkIn), 1) : 1;

  const pricePerUnit = selectedVariant?.price_value ?? rental.price_value ?? 0;
  const totalPrice = pricePerUnit * numDays;

  const isAvailable = availability ? availability.available > 0 : true;
  const isLimited = availability ? availability.available === 1 : false;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleBookNow = async () => {
    if (!checkIn || !checkOut) {
      toast({ title: "Select dates", description: "Please pick check-in and check-out dates.", variant: "destructive" });
      return;
    }
    if (!isAvailable) {
      toast({ title: "Not available", description: "This item is sold out for selected dates.", variant: "destructive" });
      return;
    }

    const holdId = await createHold({
      rentalId: rental.id,
      variantId: selectedVariant?.id,
      checkIn: checkInStr!,
      checkOut: checkOutStr!,
      slot,
    });

    if (holdId) {
      setStep("details");
    }
  };

  const handleConfirm = async () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      toast({ title: "Required fields", description: "Please fill name and phone number.", variant: "destructive" });
      return;
    }

    if (!hold) return;

    const confirmed = await confirmHold(hold.id);
    if (!confirmed) return;

    // Create rental order
    const orderId = crypto.randomUUID();
    createOrder.mutate({
      title: rental.title + (selectedVariant ? ` - ${selectedVariant.attribute_value}` : ""),
      equipment_category: rental.categories?.[0] || "General",
      equipment_details: JSON.stringify({
        rental_id: rental.id,
        check_in: checkInStr,
        check_out: checkOutStr,
        slot,
        days: numDays,
        price_per_day: pricePerUnit,
        total: totalPrice,
      }),
      event_date: checkInStr,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail || undefined,
      budget: `₹${totalPrice.toLocaleString()}`,
    });

    setStep("countdown"); // Will show confirmed state
  };

  if (isConfirmed) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-bold text-sm">Booking Confirmed!</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Your booking for {rental.title} from {checkIn && format(checkIn, "dd MMM yyyy")} to {checkOut && format(checkOut, "dd MMM yyyy")} has been confirmed.
          Our team will contact you shortly.
        </p>
        <Button variant="outline" size="sm" onClick={() => { clearHold(); setStep("dates"); }}>
          Book Another
        </Button>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-bold text-sm">Session Expired</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Your 10-minute hold has expired. Please try booking again.
        </p>
        <Button size="sm" onClick={() => { clearHold(); setStep("dates"); }}>
          Try Again
        </Button>
      </div>
    );
  }

  // Step 2: Fill details (hold active)
  if (step === "details" && isHeld) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        {/* Timer */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Complete your booking</span>
          <Badge variant={timeLeft < 120 ? "destructive" : "secondary"} className="gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {formatTime(timeLeft)}
          </Badge>
        </div>

        {/* Booking summary */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dates</span>
            <span className="font-medium text-foreground">
              {checkIn && format(checkIn, "dd MMM")} → {checkOut && format(checkOut, "dd MMM")}
            </span>
          </div>
          {isVenue && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slot</span>
              <span className="font-medium text-foreground capitalize">{slot.replace("_", " ")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold text-primary">₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Customer details */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Name *</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Your name" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Phone *</Label>
            <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 98765 43210" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="email@example.com" className="h-9 text-sm" />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleConfirm} className="flex-1 h-11" disabled={holdLoading || createOrder.isPending}>
            {holdLoading || createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Confirm Booking
          </Button>
          <Button variant="outline" onClick={() => { if (hold) cancelHold(hold.id); setStep("dates"); }} className="h-11">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Select dates
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground">Book this item</h3>

      {/* Date pickers */}
      <div className="grid grid-cols-2 gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal h-10 text-xs", !checkIn && "text-muted-foreground")}>
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              {checkIn ? format(checkIn, "dd MMM") : "Check-in"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={(d) => { setCheckIn(d); if (d && checkOut && d >= checkOut) setCheckOut(undefined); }}
              disabled={(date) => date < today}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal h-10 text-xs", !checkOut && "text-muted-foreground")}>
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              {checkOut ? format(checkOut, "dd MMM") : "Check-out"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => date < (checkIn || today)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Slot selector for venues */}
      {isVenue && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-foreground">Select Slot</span>
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
      )}

      {/* Availability status */}
      {checkIn && checkOut && (
        <div className="flex items-center gap-2">
          {availLoading ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
            </span>
          ) : isAvailable ? (
            <Badge variant="secondary" className={cn("text-xs gap-1", isLimited ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")}>
              <CheckCircle2 className="h-3 w-3" />
              {isLimited ? "Limited Availability" : "Available"}
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" /> Sold Out
            </Badge>
          )}
        </div>
      )}

      {/* Price calculation */}
      {checkIn && checkOut && pricePerUnit > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">₹{pricePerUnit.toLocaleString()} × {numDays} day{numDays > 1 ? "s" : ""}</span>
            <span className="font-medium text-foreground">₹{totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
            <span>Total</span>
            <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Book Now */}
      <Button
        onClick={handleBookNow}
        className="w-full h-12 text-sm font-semibold"
        disabled={!checkIn || !checkOut || !isAvailable || holdLoading}
      >
        {holdLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {!isAvailable ? "Sold Out" : "Book Now"}
      </Button>

      <p className="text-[10px] text-muted-foreground text-center">
        Your slot will be held for 10 minutes after clicking Book Now
      </p>
    </div>
  );
};

export default BookingWidget;
