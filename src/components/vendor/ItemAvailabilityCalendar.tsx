import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVendorAvailability, useToggleBookedDate } from "@/hooks/useVendorAvailability";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

const SLOT_OPTIONS_VENUE = [
  { value: "full_day", label: "Full Day" },
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
];

const SLOT_OPTIONS_CREW = [
  { value: "full_day", label: "Full Day" },
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
];

const SLOT_OPTIONS_RENTAL = [
  { value: "full_day", label: "Full Day" },
];

interface ItemAvailabilityCalendarProps {
  itemId: string;
  serviceType: string;
}

const ItemAvailabilityCalendar = ({ itemId, serviceType }: ItemAvailabilityCalendarProps) => {
  const slotOptions = serviceType === "venue" ? SLOT_OPTIONS_VENUE
    : serviceType === "crew" ? SLOT_OPTIONS_CREW
    : SLOT_OPTIONS_RENTAL;

  const [selectedSlot, setSelectedSlot] = useState("full_day");
  const { data: availability, isLoading } = useVendorAvailability(itemId);
  const { mutate: toggleDate, isPending } = useToggleBookedDate();

  const dateSlotMap = useMemo(() => {
    if (!availability) return new Map<string, string[]>();
    const map = new Map<string, string[]>();
    availability.forEach(a => {
      const slots = map.get(a.date) || [];
      const slot = (a as any).slot || "full_day";
      if (!slots.includes(slot)) slots.push(slot);
      map.set(a.date, slots);
    });
    return map;
  }, [availability]);

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const existingSlots = dateSlotMap.get(dateStr) || [];
    const isSlotBooked = existingSlots.includes(selectedSlot);

    toggleDate({
      date: dateStr,
      inventoryItemId: itemId,
      isBooked: !isSlotBooked,
      slot: selectedSlot,
    });
  };

  const modifiers = useMemo(() => {
    const fullyBooked: Date[] = [];
    const partiallyBooked: Date[] = [];

    dateSlotMap.forEach((slots, dateStr) => {
      const d = new Date(dateStr + "T00:00:00");
      if (slots.includes("full_day") || (slots.includes("morning") && slots.includes("evening"))) {
        fullyBooked.push(d);
      } else {
        partiallyBooked.push(d);
      }
    });

    return { fullyBooked, partiallyBooked };
  }, [dateSlotMap]);

  const modifiersStyles = {
    fullyBooked: {
      backgroundColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
      borderRadius: "50%",
    },
    partiallyBooked: {
      backgroundColor: "hsl(45 93% 47%)",
      color: "hsl(0 0% 100%)",
      borderRadius: "50%",
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="border-t pt-4 mt-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span>Fully Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(45 93% 47%)" }} />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border border-border" />
            <span>Available</span>
          </div>
        </div>
        {slotOptions.length > 1 && (
          <Select value={selectedSlot} onValueChange={setSelectedSlot}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {slotOptions.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Click dates to toggle. Slot: <strong>{slotOptions.find(s => s.value === selectedSlot)?.label}</strong>
      </p>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          onDayClick={handleDayClick}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          disabled={isPending}
          className="rounded-md border text-sm"
        />
      </div>

      {availability && availability.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="font-medium text-xs">Booked ({availability.length})</h4>
          <div className="flex flex-wrap gap-1.5">
            {availability.slice(0, 12).map((entry) => (
              <Badge key={entry.id} variant="destructive" className="text-[10px]">
                {format(new Date(entry.date + "T00:00:00"), "MMM d")}
                {(entry as any).slot && (entry as any).slot !== "full_day" && (
                  <span className="ml-1 opacity-75">({(entry as any).slot})</span>
                )}
              </Badge>
            ))}
            {availability.length > 12 && (
              <Badge variant="secondary" className="text-[10px]">+{availability.length - 12} more</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemAvailabilityCalendar;
