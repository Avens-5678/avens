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

const AvailabilityCalendar = () => {
  const [selectedItemId, setSelectedItemId] = useState<string>("all");
  const { data: inventory } = useVendorInventory();
  const { data: availability, isLoading } = useVendorAvailability(
    selectedItemId === "all" ? undefined : selectedItemId
  );
  const { mutate: toggleDate, isPending } = useToggleBookedDate();

  const bookedDates = useMemo(() => {
    if (!availability) return new Set<string>();
    return new Set(availability.map((a) => a.date));
  }, [availability]);

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const isBooked = bookedDates.has(dateStr);

    toggleDate({
      date: dateStr,
      inventoryItemId: selectedItemId === "all" ? undefined : selectedItemId,
      isBooked: !isBooked,
    });
  };

  const modifiers = useMemo(() => {
    const booked: Date[] = [];
    bookedDates.forEach((d) => booked.push(new Date(d + "T00:00:00")));
    return { booked };
  }, [bookedDates]);

  const modifiersStyles = {
    booked: {
      backgroundColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-destructive" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border border-border" />
            <span>Available</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Click on a date to mark it as booked or available.
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
