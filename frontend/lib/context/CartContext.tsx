"use client";

/**
 * lib/context/CartContext.tsx
 * ---------------------------
 * Zustand tabanlı global sepet store.
 * - localStorage'da kalıcı (persist middleware)
 * - Giriş yapmadan çalışır
 * - Provider'a gerek yok — doğrudan useCartStore() ile kullanılır
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ============================================================
   TİPLER
   ============================================================ */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;         // Gösterilecek fiyat (indirimli varsa o)
  originalPrice: number; // Ham fiyat
  imageUrl: string;
  category: string;
  brand: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  /* Actions */
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  /* Selectors */
  totalCount: () => number;
  totalPrice: () => number;
  isInCart: (productId: string) => boolean;
}

/* ============================================================
   STORE
   ============================================================ */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(i => i.productId === newItem.productId);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === newItem.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(i => i.productId !== productId),
        }));
      },

      updateQty: (productId, qty) => {
        if (qty < 1) {
          set((state) => ({
            items: state.items.filter(i => i.productId !== productId),
          }));
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity: qty } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      isInCart: (productId) =>
        get().items.some(i => i.productId === productId),
    }),
    {
      name: "techstore_cart",          // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
