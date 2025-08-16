import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price_range?: string;
  image_url?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        if (!items.find(i => i.id === item.id)) {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== id) });
      },
      clearCart: () => set({ items: [] }),
      isInCart: (id) => {
        const { items } = get();
        return items.some(item => item.id === id);
      },
    }),
    {
      name: 'rental-cart',
    }
  )
);