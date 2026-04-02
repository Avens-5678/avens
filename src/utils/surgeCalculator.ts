/**
 * Dynamic surge pricing calculator.
 * Applies seasonal / weekend / demand-based multipliers
 * on top of existing tiered markup.
 */

import { differenceInDays, getDay } from "date-fns";

export interface SurgeRule {
  id: string;
  name: string;
  city: string | null;
  category: string | null;
  rule_type: string;
  surge_multiplier: number;
  start_date: string | null;
  end_date: string | null;
  day_of_week: number[] | null;
  min_booking_ratio: number | null;
  priority: number;
  is_active: boolean;
}

export interface SurgeResult {
  isActive: boolean;
  multiplier: number;
  appliedRule: SurgeRule | null;
  originalPrice: number;
  surgedPrice: number;
  surgeAmount: number;
  label: string | null;
  isEarlyBird: boolean;
  earlyBirdSaving: number;
}

// Map service_type to surge category
const SERVICE_TO_CATEGORY: Record<string, string> = {
  rental: "equipment",
  venue: "venue",
  crew: "crew",
};

/**
 * Calculate early bird discount on surge.
 * 60+ days: no surge. 30-59 days: half surge. <30 days: full surge.
 */
function applyEarlyBird(
  eventDate: Date,
  surgeMultiplier: number
): { isEligible: boolean; adjustedMultiplier: number } {
  const daysAhead = differenceInDays(eventDate, new Date());

  if (daysAhead >= 60) {
    return { isEligible: true, adjustedMultiplier: 1.0 };
  } else if (daysAhead >= 30) {
    return {
      isEligible: true,
      adjustedMultiplier: 1 + (surgeMultiplier - 1) * 0.5,
    };
  }
  return { isEligible: false, adjustedMultiplier: surgeMultiplier };
}

/**
 * Calculate surge pricing for a given product.
 *
 * @param price - The already-marked-up client price
 * @param city - Customer/vendor city (null to match all)
 * @param serviceType - "rental" | "venue" | "crew"
 * @param eventDate - The event/booking date
 * @param surgeRules - Active surge rules from DB
 */
export function calculateSurge(
  price: number,
  city: string | null,
  serviceType: string,
  eventDate: Date | null,
  surgeRules: SurgeRule[]
): SurgeResult {
  const noSurge: SurgeResult = {
    isActive: false, multiplier: 1, appliedRule: null,
    originalPrice: price, surgedPrice: price, surgeAmount: 0,
    label: null, isEarlyBird: false, earlyBirdSaving: 0,
  };

  if (!eventDate || surgeRules.length === 0) return noSurge;

  const category = SERVICE_TO_CATEGORY[serviceType] || "equipment";
  const eventDow = getDay(eventDate); // 0=Sun ... 6=Sat

  // Filter matching rules
  const matching = surgeRules
    .filter((r) => {
      if (!r.is_active) return false;
      // Skip demand_based (needs server-side booking data)
      if (r.rule_type === "demand_based") return false;
      // City match
      if (r.city && city && r.city.toLowerCase() !== city.toLowerCase()) return false;
      // Category match
      if (r.category && r.category !== category) return false;

      if (r.rule_type === "date_range") {
        // Date range check
        if (r.start_date && r.end_date) {
          const start = new Date(r.start_date);
          const end = new Date(r.end_date);
          if (eventDate < start || eventDate > end) return false;
        }
        // Day of week check (if no date range, just DOW)
        if (r.day_of_week && r.day_of_week.length > 0 && !r.start_date) {
          if (!r.day_of_week.includes(eventDow)) return false;
        }
        return true;
      }

      if (r.rule_type === "manual") return true;

      return false;
    })
    .sort((a, b) => b.priority - a.priority);

  if (matching.length === 0) return noSurge;

  // Use highest priority rule (don't stack)
  const rule = matching[0];
  let multiplier = rule.surge_multiplier;

  // Apply early bird discount
  const earlyBird = applyEarlyBird(eventDate, multiplier);
  multiplier = earlyBird.adjustedMultiplier;

  if (multiplier <= 1.0) {
    return {
      ...noSurge,
      isEarlyBird: earlyBird.isEligible,
      label: earlyBird.isEligible ? "Early bird — no surge!" : null,
    };
  }

  const surgedPrice = Math.round((price * multiplier) / 10) * 10;
  const surgeAmount = surgedPrice - price;
  const fullSurgePrice = Math.round((price * rule.surge_multiplier) / 10) * 10;
  const earlyBirdSaving = earlyBird.isEligible ? fullSurgePrice - surgedPrice : 0;

  // Generate label
  let label: string;
  if (rule.name.toLowerCase().includes("weekend")) label = "Weekend rate";
  else if (rule.name.toLowerCase().includes("diwali")) label = "Diwali pricing";
  else if (rule.name.toLowerCase().includes("new year")) label = "New Year pricing";
  else if (rule.name.toLowerCase().includes("wedding")) label = "Peak season pricing";
  else label = "Peak pricing";

  if (earlyBird.isEligible) label = `Early bird — ${label} reduced`;

  return {
    isActive: true,
    multiplier,
    appliedRule: rule,
    originalPrice: price,
    surgedPrice,
    surgeAmount,
    label,
    isEarlyBird: earlyBird.isEligible,
    earlyBirdSaving,
  };
}

/**
 * Hook-friendly: fetch surge rules query key
 */
export const SURGE_RULES_QUERY_KEY = ["surge-rules"];
