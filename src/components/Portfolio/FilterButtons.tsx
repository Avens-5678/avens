import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useData";

interface FilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterButtons = ({ activeFilter, onFilterChange }: FilterButtonsProps) => {
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <div className="animate-pulse">
          <div className="h-10 w-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Get unique event types from active events
  const eventTypes = events?.reduce((acc: string[], event) => {
    if (event.is_active && event.event_type && !acc.includes(event.event_type)) {
      acc.push(event.event_type);
    }
    return acc;
  }, []) || [];

  // Create filters array with proper labels
  const filters = [
    { key: "all", label: "All" },
    ...eventTypes.map(eventType => ({
      key: eventType,
      label: eventType.charAt(0).toUpperCase() + eventType.slice(1).replace('-', ' ')
    }))
  ];

  console.log('FilterButtons debug:', { events: events?.length, eventTypes, filters, activeFilter });

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex md:hidden overflow-x-auto scrollbar-hide gap-2 mb-8 pb-1">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              activeFilter === filter.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {/* Desktop: wrap */}
      <div className="hidden md:flex flex-wrap justify-center gap-3 mb-12">
        {filters.map((filter) => (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "outline"}
            onClick={() => onFilterChange(filter.key)}
            className={`
              px-6 py-2 font-medium transition-all duration-300
              ${activeFilter === filter.key 
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-elegant" 
                : "border-border hover:border-hover hover:bg-hover/10 hover:text-hover"
              }
            `}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </>
  );
};

export default FilterButtons;