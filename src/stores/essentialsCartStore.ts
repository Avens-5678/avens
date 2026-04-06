import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EssentialsCartItem {
  product_id: string;
  name: string;
  price: number;
  compare_price?: number;
  quantity: number;
  image_url: string;
  max_qty: number;
  stock_count: number;
  vendor_id: string;
}

interface EssentialsCartStore {
  items: EssentialsCartItem[];
  addItem: (item: Omit<EssentialsCartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (product_id: string) => void;
  updateQuantity: (product_id: string, qty: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  getDeliveryFee: (type: "express" | "standard" | "scheduled") => number;
}

export const useEssentialsCart = create<EssentialsCartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.product_id === item.product_id);
        if (existing) {
          const newQty = Math.min(
            existing.quantity + (item.quantity || 1),
            item.max_qty,
            item.stock_count
          );
          set({
            items: items.map((i) =>
              i.product_id === item.product_id ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { ...item, quantity: item.quantity || 1 } as EssentialsCartItem,
            ],
          });
        }
      },

      removeItem: (product_id) => {
        set({ items: get().items.filter((i) => i.product_id !== product_id) });
      },

      updateQuantity: (product_id, qty) => {
        const { items } = get();
        if (qty <= 0) {
          set({ items: items.filter((i) => i.product_id !== product_id) });
        } else {
          set({
            items: items.map((i) =>
              i.product_id === product_id
                ? { ...i, quantity: Math.min(qty, i.max_qty, i.stock_count) }
                : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      getDeliveryFee: (type) => {
        const subtotal = get().getSubtotal();
        switch (type) {
          case "express":
            return 49;
          case "standard":
            return 29;
          case "scheduled":
            return subtotal >= 499 ? 0 : 29;
          default:
            return 29;
        }
      },
    }),
    { name: "essentials_cart" }
  )
);
