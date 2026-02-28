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
