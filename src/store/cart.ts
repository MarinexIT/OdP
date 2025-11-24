import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string; // unikalne ID (timestamp)
  name: string;
  config: {
    lengthId: string;
    colors: string[];
    carabinerId: string;
    description: string; // "Smycz 5m, Czerwona+Czarna, Złoty"
  };
  price: number;
  quantity: number;
  image?: string; // ścieżka do podglądu (opcjonalnie)
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: Date.now().toString() }]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    }),
    {
      name: 'odwalonypupil-cart',
    }
  )
);


