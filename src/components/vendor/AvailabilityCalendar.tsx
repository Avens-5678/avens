import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVendorAvailability, useToggleBookedDate } from "@/hooks/useVendorAvailability";
import { useVendorInventory } from "@/hooks/useVendorInventory";
import { CalendarDays, Loader2 } from "lucide-react";
import { format } from "date-fns";

const SLOT_OPTIONS = [
  { value: "full_day", label: "Full Day" },
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
];

const AvailabilityCalendar = () => {
  const [selectedItemId, setSelectedItemId] = useState<string>("all");
  const [selectedSlot, setSelectedSlot] = useState<string>("full_day");
  const { data: inventory } = useVendorInventory();
  const { data: availability, isLoading } = useVendorAvailability(
    selectedItemId === "all" ? undefined : selectedItemId
  );
  const { mutate: toggleDate, isPending } = useToggleBookedDate();

  // Group by date to understand partial/full booking
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

  const bookedDates = useMemo(() => {
    if (!availability) return new Set<string>();
    return new Set(availability.map(a => a.date));
  }, [availability]);

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const existingSlots = dateSlotMap.get(dateStr) || [];
    const isSlotBooked = existingSlots.includes(selectedSlot);

    toggleDate({
      date: dateStr,
      inventoryItemId: selectedItemId === "all" ? undefined : selectedItemId,
      isBooked: !isSlotBooked,
      notes: `Slot: ${selectedSlot}`,
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
          <div className="flex gap-2">
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Slot" />
              </SelectTrigger>
              <SelectContent>
                {SLOT_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                {inventory?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-destructive" />
            <span>Fully Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: "hsl(45 93% 47%)" }} />
            <span>Partially Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border border-border" />
            <span>Available</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Select a slot type, then click dates to toggle booking. Current: <strong>{SLOT_OPTIONS.find(s => s.value === selectedSlot)?.label}</strong>
        </p>

        <div className="flex justify-center">
          <Calendar
            mode="single"
            onDayClick={handleDayClick}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            numberOfMonths={2}
            disabled={isPending}
            className="rounded-md border"
          />
        </div>

        {availability && availability.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Booked Dates ({availability.length})</h4>
            <div className="flex flex-wrap gap-2">
              {availability.slice(0, 20).map((entry) => (
                <Badge key={entry.id} variant="destructive" className="text-xs">
                  {format(new Date(entry.date + "T00:00:00"), "MMM d, yyyy")}
                  {(entry as any).slot && (entry as any).slot !== "full_day" && (
                    <span className="ml-1 opacity-75">({(entry as any).slot})</span>
                  )}
                </Badge>
              ))}
              {availability.length > 20 && (
                <Badge variant="secondary">+{availability.length - 20} more</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
