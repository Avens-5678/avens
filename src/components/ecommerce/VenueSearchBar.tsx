import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Users, Search, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  "Wedding", "Haldi", "Mehendi", "Sangeet", "Reception",
  "Corporate", "Birthday", "Anniversary", "Engagement",
  "Conference", "Exhibition", "Baby Shower",
];

const SLOTS = [
  { value: "morning", label: "Morning (8AM–2PM)" },
  { value: "evening", label: "Evening (3PM–10PM)" },
  { value: "full_day", label: "Full Day" },
];

interface VenueSearchBarProps {
  onSearch: (filters: {
    date?: string;
    slot?: string;
    eventType?: string;
    guestCount?: number;
  }) => void;
}

const VenueSearchBar = ({ onSearch }: VenueSearchBarProps) => {
  const [date, setDate] = useState<Date>();
  const [slot, setSlot] = useState("full_day");
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");

  const handleSearch = () => {
    onSearch({
      date: date ? format(date, "yyyy-MM-dd") : undefined,
      slot,
      eventType: eventType || undefined,
      guestCount: guestCount ? parseInt(guestCount) : undefined,
    });
  };

  const today = new Date();

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-soft">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        {/* Date + Slot */}
        <div className="flex gap-2 flex-1 min-w-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal h-10 text-xs",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                {date ? format(date, "dd MMM yyyy") : "Event Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < today}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Select value={slot} onValueChange={setSlot}>
            <SelectTrigger className="w-[140px] h-10 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SLOTS.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Type */}
        <div className="flex-1 min-w-0">
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="h-10 text-xs">
              <PartyPopper className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Events</SelectItem>
              {EVENT_TYPES.map((et) => (
                <SelectItem key={et} value={et.toLowerCase()} className="text-xs">
                  {et}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Guest Count */}
        <div className="w-full sm:w-32">
          <div className="relative">
            <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="Guests"
              className="h-10 text-xs pl-8"
              min={1}
            />
          </div>
        </div>

        {/* Search */}
        <Button onClick={handleSearch} className="h-10 px-5 text-xs font-semibold gap-1.5">
          <Search className="h-3.5 w-3.5" /> Search
        </Button>
      </div>
    </div>
  );
};

export default VenueSearchBar;
