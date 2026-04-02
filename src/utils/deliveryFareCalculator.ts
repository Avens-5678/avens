/**
 * Client-side delivery fare calculator.
 * Mirrors the logic in calculate-dynamic-route edge function.
 * Used for instant estimates before server call, and for
 * generating fee breakdowns for display.
 */

export interface VehicleTier {
  id: string;
  vehicle_type: string;
  min_volume_units: number;
  max_volume_units: number | null;
  base_fare: number;
  per_km_rate: number;
  night_surge_multiplier: number;
  max_weight_kg?: number;
  icon_name?: string;
  display_order: number;
}

export interface FareBreakdownItem {
  label: string;
  amount: number;
}

export interface FareCalculation {
  vehicleTier: VehicleTier;
  distanceKm: number;
  durationMinutes: number;
  baseFare: number;
  extraKm: number;
  distanceFare: number;
  surgeMultiplier: number;
  surgeApplied: boolean;
  totalFare: number;
  breakdown: FareBreakdownItem[];
}

const INCLUDED_KM = 5; // First 5 km included in base fare

/**
 * Select the appropriate vehicle tier based on total volume units.
 */
export function selectVehicleTier(
  totalVolumeUnits: number,
  tiers: VehicleTier[]
): VehicleTier {
  const sorted = [...tiers].sort((a, b) => a.min_volume_units - b.min_volume_units);

  for (const tier of sorted) {
    const inRange = tier.max_volume_units == null
      ? totalVolumeUnits >= tier.min_volume_units
      : totalVolumeUnits >= tier.min_volume_units && totalVolumeUnits <= tier.max_volume_units;
    if (inRange) return tier;
  }

  // No match — use the largest tier
  return sorted[sorted.length - 1] || {
    id: "", vehicle_type: "Tata Ace", min_volume_units: 0, max_volume_units: null,
    base_fare: 800, per_km_rate: 25, night_surge_multiplier: 1.5, display_order: 0,
  };
}

/**
 * Calculate delivery fare given distance, volume, and vehicle tiers.
 */
export function calculateDeliveryFare(
  distanceKm: number,
  durationMinutes: number,
  totalVolumeUnits: number,
  vehicleTiers: VehicleTier[],
  deliveryHour?: number
): FareCalculation {
  const tier = selectVehicleTier(totalVolumeUnits, vehicleTiers);

  const extraKm = Math.max(0, distanceKm - INCLUDED_KM);
  const distanceFare = Math.round(extraKm * tier.per_km_rate);

  // Night surge: 10 PM - 6 AM
  const surgeApplied = deliveryHour != null && (deliveryHour >= 22 || deliveryHour < 6);
  const surgeMultiplier = surgeApplied ? tier.night_surge_multiplier : 1;

  const rawTotal = (tier.base_fare + distanceFare) * surgeMultiplier;
  // Round to nearest ₹10
  const totalFare = Math.round(rawTotal / 10) * 10;

  const breakdown: FareBreakdownItem[] = [
    { label: `Base fare (first ${INCLUDED_KM} km)`, amount: tier.base_fare },
  ];
  if (extraKm > 0) {
    breakdown.push({
      label: `${Math.round(extraKm * 10) / 10} km × ₹${tier.per_km_rate}/km`,
      amount: distanceFare,
    });
  }
  if (surgeApplied) {
    breakdown.push({
      label: `Night surge (×${tier.night_surge_multiplier})`,
      amount: Math.round(rawTotal - (tier.base_fare + distanceFare)),
    });
  }

  return {
    vehicleTier: tier,
    distanceKm,
    durationMinutes,
    baseFare: tier.base_fare,
    extraKm: Math.round(extraKm * 10) / 10,
    distanceFare,
    surgeMultiplier,
    surgeApplied,
    totalFare,
    breakdown,
  };
}

/**
 * Calculate total volume units from cart items.
 */
export function calculateVolumeUnits(
  items: { volume_units?: number; quantity: number }[]
): number {
  return items.reduce((sum, item) => sum + (item.volume_units || 1) * item.quantity, 0);
}

/**
 * Haversine distance in km (client-side fallback).
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Vehicle tier icon mapping for UI.
 */
export const VEHICLE_ICONS: Record<string, string> = {
  bike: "🏍️",
  "mini-truck": "🚛",
  pickup: "🚙",
  truck: "🚚",
};
