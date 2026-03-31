import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price_value?: number | null;
  pricing_unit?: string;
  price_range?: string;
  image_url?: string;
  quantity: number;
  variant_id?: string;
  variant_label?: string;
  service_type?: string;
  /** For measurable items (sq.ft/sq.m): length dimension */
  length?: number;
  /** For measurable items (sq.ft/sq.m): breadth dimension */
  breadth?: number;
  /** Volume/weight units for manpower calculation */
  labor_weight?: number;
  /** Vendor ID for vendor-sourced items */
  vendor_id?: string;
  /** Vendor's warehouse pincode for transport calculation */
  vendor_pincode?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variant_id?: string) => void;
  updateQuantity: (id: string, quantity: number, variant_id?: string) => void;
  updateDimensions: (id: string, length: number, breadth: number, variant_id?: string) => void;
  clearCart: () => void;
  isInCart: (id: string, variant_id?: string) => boolean;
  getItemCount: () => number;
}

const getCartKey = (id: string, variant_id?: string) => variant_id ? `${id}__${variant_id}` : id;

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const key = getCartKey(item.id, item.variant_id);
        const existing = items.find(i => getCartKey(i.id, i.variant_id) === key);
        if (existing) {
          set({
            items: items.map(i =>
              getCartKey(i.id, i.variant_id) === key
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
        }
      },
      removeItem: (id, variant_id) => {
        const { items } = get();
        const key = getCartKey(id, variant_id);
        set({ items: items.filter(i => getCartKey(i.id, i.variant_id) !== key) });
      },
      updateQuantity: (id, quantity, variant_id) => {
        const { items } = get();
        const key = getCartKey(id, variant_id);
        if (quantity <= 0) {
          set({ items: items.filter(i => getCartKey(i.id, i.variant_id) !== key) });
        } else {
          set({
            items: items.map(i =>
              getCartKey(i.id, i.variant_id) === key ? { ...i, quantity } : i
            ),
          });
        }
      },
      updateDimensions: (id, length, breadth, variant_id) => {
        const { items } = get();
        const key = getCartKey(id, variant_id);
        set({
          items: items.map(i =>
            getCartKey(i.id, i.variant_id) === key
              ? { ...i, length, breadth, quantity: length * breadth }
              : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      isInCart: (id, variant_id) => {
        const { items } = get();
        const key = getCartKey(id, variant_id);
        return items.some(i => getCartKey(i.id, i.variant_id) === key);
      },
      getItemCount: () => {
        const { items } = get();
        return items.length;
      },
    }),
    {
      name: 'rental-cart',
    }
  )
);
