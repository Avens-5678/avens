import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface BookingSearchBarProps {
  onSearch: (params: { location: string; checkIn: Date | undefined; checkOut: Date | undefined }) => void;
}

const BookingSearchBar = ({ onSearch }: BookingSearchBarProps) => {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();

  const handleSearch = () => {
    onSearch({ location, checkIn, checkOut });
  };

  const today = new Date();

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3">
        {/* Location */}
        <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 bg-muted/50 rounded-lg">
          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or area..."
            className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
          />
        </div>

        {/* Check-in */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal min-w-[140px] h-10",
                !checkIn && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {checkIn ? format(checkIn, "dd MMM") : "Check-in"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={(d) => {
                setCheckIn(d);
                if (d && checkOut && d >= checkOut) setCheckOut(undefined);
              }}
              disabled={(date) => date < today}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Check-out */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal min-w-[140px] h-10",
                !checkOut && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
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

        {/* Search button */}
        <Button onClick={handleSearch} className="h-10 px-6 gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>
    </div>
  );
};

export default BookingSearchBar;
