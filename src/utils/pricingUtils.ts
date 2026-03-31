/**
 * Determines if a pricing unit is "measurable" (area-based) vs "countable" (unit-based).
 * Measurable items use a text input for quantity, countable use a stepper.
 */
export const MEASURABLE_UNITS = ["Per Sq.Ft", "Per Sq.M", "per sq.ft", "per sq.m", "sq.ft", "sq.m"];

export const isMeasurableUnit = (pricingUnit?: string | null): boolean => {
  if (!pricingUnit) return false;
  return MEASURABLE_UNITS.some(u => pricingUnit.toLowerCase().includes(u.toLowerCase()));
};

/**
 * Calculate line total for a cart item.
 * Both countable and measurable use: quantity * price_value
 * The difference is UI only (stepper vs text input).
 */
export const calculateItemTotal = (priceValue: number | null | undefined, quantity: number): number | null => {
  if (priceValue == null) return null;
  return priceValue * quantity;
};

/**
 * Calculate cart totals for mixed items.
 */
export const calculateCartTotal = (items: Array<{ price_value?: number | null; quantity: number }>): {
  calculatedTotal: number;
  hasQuoteItems: boolean;
} => {
  let calculatedTotal = 0;
  let hasQuoteItems = false;

  for (const item of items) {
    const itemTotal = calculateItemTotal(item.price_value, item.quantity);
    if (itemTotal != null) {
      calculatedTotal += itemTotal;
    } else {
      hasQuoteItems = true;
    }
  }

  return { calculatedTotal, hasQuoteItems };
};

// ─── Instant Booking Engine ─────────────────────────────────────

/**
 * Apply platform markup to vendor base price.
 */
export const applyMarkup = (vendorBasePrice: number, markupPercent: number): number => {
  return Math.round(vendorBasePrice * (1 + markupPercent / 100));
};

/**
 * Calculate manpower fee based on labor weight of all cart items.
 * Rule: every `laborUnitsPerLoader` weight units requires 1 loader at `loaderDailyRate`.
 */
export const calculateManpowerFee = (
  items: Array<{ labor_weight?: number; quantity: number }>,
  laborUnitsPerLoader: number,
  loaderDailyRate: number
): number => {
  const totalWeight = items.reduce((sum, item) => {
    return sum + (item.labor_weight || 1) * item.quantity;
  }, 0);

  if (totalWeight <= 0) return 0;

  const loadersNeeded = Math.ceil(totalWeight / laborUnitsPerLoader);
  return loadersNeeded * loaderDailyRate;
};

/**
 * Transport tier type matching the database table.
 */
export interface TransportTier {
  id: string;
  min_km: number;
  max_km: number | null;
  base_fee: number;
  per_km_fee: number;
  vehicle_type: string;
}

/**
 * Calculate transport fee based on distance and tier rules.
 */
export const calculateTransportFee = (distanceKm: number, tiers: TransportTier[]): number => {
  // Sort tiers by min_km ascending
  const sorted = [...tiers].sort((a, b) => a.min_km - b.min_km);

  for (const tier of sorted) {
    const inRange = tier.max_km == null
      ? distanceKm >= tier.min_km
      : distanceKm >= tier.min_km && distanceKm < tier.max_km;

    if (inRange) {
      const extraKm = tier.max_km == null ? distanceKm - tier.min_km : 0;
      return tier.base_fee + extraKm * (tier.per_km_fee || 0);
    }
  }

  // Fallback: use last tier
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    const extraKm = distanceKm - last.min_km;
    return last.base_fee + Math.max(0, extraKm) * (last.per_km_fee || 0);
  }

  return 0;
};

/**
 * Check if booking date is at least `minHours` away from now.
 */
export const isInstantBookable = (eventDateStr: string, minBookingHours: number): boolean => {
  const eventDate = new Date(eventDateStr);
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= minBookingHours;
};
