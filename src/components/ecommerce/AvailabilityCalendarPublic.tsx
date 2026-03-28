import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, addMonths, eachDayOfInterval } from "date-fns";

interface AvailabilityCalendarPublicProps {
  rentalId: string;
  className?: string;
}

const AvailabilityCalendarPublic = ({ rentalId, className }: AvailabilityCalendarPublicProps) => {
  const today = new Date();
  const rangeStart = startOfMonth(today);
  const rangeEnd = endOfMonth(addMonths(today, 2));

  // Fetch booked dates from vendor_availability
  const { data: bookedDates } = useQuery({
    queryKey: ["public_availability", rentalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_availability")
        .select("date, slot, is_booked")
        .eq("inventory_item_id", rentalId)
        .eq("is_booked", true)
        .gte("date", format(rangeStart, "yyyy-MM-dd"))
        .lte("date", format(rangeEnd, "yyyy-MM-dd"));

      if (error) throw error;
      return data || [];
    },
    enabled: !!rentalId,
  });

  // Fetch active holds
  const { data: heldDates } = useQuery({
    queryKey: ["public_holds", rentalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservation_holds")
        .select("check_in, check_out, slot, status, expires_at")
        .eq("rental_id", rentalId)
        .eq("status", "held")
        .gte("expires_at", new Date().toISOString());

      if (error) throw error;
      return data || [];
    },
    enabled: !!rentalId,
    refetchInterval: 30000,
  });

  const blockedDays = useMemo(() => {
    const blocked = new Set<string>();

    // Booked dates
    bookedDates?.forEach((d: any) => {
      if (d.slot === "full_day") blocked.add(d.date);
    });

    // Held date ranges
    heldDates?.forEach((h: any) => {
      const days = eachDayOfInterval({
        start: new Date(h.check_in),
        end: new Date(h.check_out),
      });
      days.forEach((day) => {
        if (h.slot === "full_day") blocked.add(format(day, "yyyy-MM-dd"));
      });
    });

    return blocked;
  }, [bookedDates, heldDates]);

  const partialDays = useMemo(() => {
    const partial = new Set<string>();

    bookedDates?.forEach((d: any) => {
      if (d.slot !== "full_day" && !blockedDays.has(d.date)) {
        partial.add(d.date);
      }
    });

    return partial;
  }, [bookedDates, blockedDays]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-800 border border-emerald-300 dark:border-emerald-700" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-800 border border-amber-300 dark:border-amber-700" /> Partial
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/30" /> Booked
        </span>
      </div>

      <Calendar
        mode="single"
        disabled={(date) => date < today}
        modifiers={{
          booked: (date) => blockedDays.has(format(date, "yyyy-MM-dd")),
          partial: (date) => partialDays.has(format(date, "yyyy-MM-dd")),
        }}
        modifiersClassNames={{
          booked: "!bg-destructive/20 !text-destructive line-through",
          partial: "!bg-amber-200 dark:!bg-amber-800 !text-amber-800 dark:!text-amber-200",
        }}
        className="p-3 pointer-events-auto rounded-xl border border-border"
        numberOfMonths={1}
      />
    </div>
  );
};

export default AvailabilityCalendarPublic;
