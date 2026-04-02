/**
 * Bundle detection and premium calculation.
 *
 * When a customer books from 2+ service categories (equipment + venue,
 * equipment + crew, venue + crew, or all 3), Evnting earns an extra
 * bundle premium on top of individual commissions.
 *
 * The customer also gets a small visible discount to incentivize bundles.
 * Net effect: Evnting earns more (premium > discount).
 */

interface CartItem {
  service_type?: string;
  price_value?: number | null;
  quantity: number;
}

type BundleType = "none" | "dual" | "triple";

// Map service_type values to display categories
const SERVICE_TO_CATEGORY: Record<string, string> = {
  rental: "equipment",
  venue: "venue",
  crew: "crew",
};

// Premium rates (what Evnting earns extra)
const PREMIUM_RATES: Record<BundleType, number> = {
  none: 0,
  dual: 0.03,   // 3% for 2 categories
  triple: 0.05, // 5% for all 3 categories
};

// Customer discount rates (shown as incentive to bundle)
const DISCOUNT_RATES: Record<BundleType, number> = {
  none: 0,
  dual: 0.02,   // 2% discount for 2 categories
  triple: 0.03, // 3% discount for all 3
};

const BUNDLE_LABELS: Record<BundleType, string> = {
  none: "",
  dual: "Dual Bundle",
  triple: "Triple Bundle",
};

export interface BundleResult {
  isBundle: boolean;
  bundleType: BundleType;
  categoriesIncluded: string[];
  premiumRate: number;
  premiumAmount: number;
  customerDiscountRate: number;
  customerDiscount: number;
  label: string;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function detectBundle(cartItems: CartItem[], subtotal: number): BundleResult {
  // Extract unique categories
  const categories = new Set<string>();
  cartItems.forEach((item) => {
    const st = item.service_type || "rental";
    const cat = SERVICE_TO_CATEGORY[st] || "equipment";
    categories.add(cat);
  });

  const catArray = Array.from(categories).sort();
  const count = catArray.length;

  let bundleType: BundleType = "none";
  if (count >= 3) bundleType = "triple";
  else if (count >= 2) bundleType = "dual";

  const premiumRate = PREMIUM_RATES[bundleType];
  const premiumAmount = r2(subtotal * premiumRate);
  const customerDiscountRate = DISCOUNT_RATES[bundleType];
  const customerDiscount = r2(subtotal * customerDiscountRate);

  return {
    isBundle: bundleType !== "none",
    bundleType,
    categoriesIncluded: catArray,
    premiumRate,
    premiumAmount,
    customerDiscountRate,
    customerDiscount,
    label: BUNDLE_LABELS[bundleType],
  };
}

/**
 * Group cart items by their service category for display.
 */
export function groupItemsByCategory<T extends { service_type?: string }>(items: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  items.forEach((item) => {
    const st = item.service_type || "rental";
    const cat = SERVICE_TO_CATEGORY[st] || "equipment";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
}

export const CATEGORY_LABELS: Record<string, string> = {
  equipment: "Equipment",
  venue: "Venue",
  crew: "Crew",
};

export const CATEGORY_ICONS: Record<string, string> = {
  equipment: "Package",
  venue: "Building2",
  crew: "Users",
};
