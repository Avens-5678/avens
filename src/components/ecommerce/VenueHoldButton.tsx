import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Lock, CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const VenueHoldButton = ({ venueId, venueName }: { venueId: string; venueName: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [holdDate, setHoldDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [calOpen, setCalOpen] = useState(false);

  // Check existing holds for this venue
  const { data: existingHolds = [] } = useQuery({
    queryKey: ["venue-holds", venueId],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("venue_holds")
        .select("hold_date, status, expires_at")
        .eq("venue_id", venueId)
        .eq("status", "active");
      return data || [];
    },
  });

  const heldDates = new Set(existingHolds.map((h: any) => h.hold_date));

  const handleHold = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to hold a date", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!holdDate) {
      toast({ title: "Select a date", description: "Choose a date to hold", variant: "destructive" });
      return;
    }

    const dateStr = format(holdDate, "yyyy-MM-dd");
    if (heldDates.has(dateStr)) {
      toast({ title: "Date unavailable", description: "This date is already held", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("venue_holds").insert({
        venue_id: venueId,
        user_id: user.id,
        hold_date: dateStr,
        amount_paid: 2000,
        status: "active",
      });
      if (error) throw error;
      toast({
        title: "Date Held! 🎉",
        description: `${venueName} locked for ${format(holdDate, "dd MMM yyyy")} for 24 hours. ₹2,000 hold applied.`,
      });
      setHoldDate(undefined);
      setCalOpen(false);
    } catch (err: any) {
      const msg = err.message?.includes("unique") ? "This date is already held" : err.message;
      toast({ title: "Hold Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-semibold text-foreground">Instant 24-Hour Hold</span>
        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-700 dark:text-amber-400">₹2,000</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Lock your preferred date so no one else can book it while you visit the venue. Fully adjustable against your final booking.
      </p>
      <div className="flex items-center gap-2">
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs h-9 flex-1">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              {holdDate ? format(holdDate, "dd MMM yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={holdDate}
              onSelect={(d) => { setHoldDate(d); setCalOpen(false); }}
              disabled={(d) => d < new Date() || heldDates.has(format(d, "yyyy-MM-dd"))}
            />
          </PopoverContent>
        </Popover>
        <Button
          size="sm"
          className="h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white"
          onClick={handleHold}
          disabled={loading || !holdDate}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
          Hold Now
        </Button>
      </div>
    </div>
  );
};

export default VenueHoldButton;
