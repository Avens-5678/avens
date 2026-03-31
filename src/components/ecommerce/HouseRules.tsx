import { AlertTriangle } from "lucide-react";

interface HouseRulesProps {
  rules: string[];
}

const HouseRules = ({ rules }: HouseRulesProps) => {
  if (!rules || rules.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        House Rules & Restrictions
      </h3>
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 space-y-2">
        {rules.map((rule, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">•</span>
            <span className="text-foreground/80">{rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HouseRules;
