import { Button } from "@/components/ui/button";

interface FilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterButtons = ({ activeFilter, onFilterChange }: FilterButtonsProps) => {
  const filters = [
    { key: "all", label: "All" },
    { key: "wedding", label: "Weddings" },
    { key: "corporate", label: "Corporate" },
    { key: "birthday", label: "Birthdays" },
    { key: "social", label: "Social" },
    { key: "government", label: "Government" },
    { key: "equipment", label: "Equipment" }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
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
  );
};

export default FilterButtons;