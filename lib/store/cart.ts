"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearServerCart, removeCartItem, setCartItem } from "@/utils/actions/cart.action";
import type { CartDraft, CartItem } from "@/lib/store/cart-item";

const STORAGE_KEY = "hng-store-cart";

export type { CartDraft, CartItem };

export type CartLine = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
  quantity: number;
  lineTotal: number;
};

type CartState = {
  items: CartItem[];
  ready: boolean;
  open: boolean;
  addItem: (product: CartDraft, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  replaceItems: (items: CartItem[]) => void;
  setReady: (ready: boolean) => void;
  setOpen: (open: boolean) => void;
};

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CartItem;
  return (
    typeof item.productId === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.category === "string" &&
    typeof item.stock === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      ready: false,
      open: false,
      setReady: (ready) => set({ ready }),
      setOpen: (open) => set({ open }),
      replaceItems: (items) => set({ items }),
      addItem: (product, quantity = 1) => {
        if (product.stock <= 0) return;
        const existing = get().items.find((item) => item.productId === product.id);
        const nextQuantity = Math.min(
          product.stock,
          (existing?.quantity ?? 0) + quantity,
        );
        const next: CartItem = {
          productId: product.id,
          quantity: nextQuantity,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
        };
        set({
          items: existing
            ? get().items.map((item) => (item.productId === product.id ? next : item))
            : [...get().items, next],
        });
        void setCartItem(product.id, nextQuantity);
      },
      setQuantity: (productId, quantity) => {
        const item = get().items.find((entry) => entry.productId === productId);
        if (!item) return;
        const nextQuantity = Math.min(item.stock, quantity);
        if (nextQuantity <= 0) {
          set({ items: get().items.filter((entry) => entry.productId !== productId) });
          void removeCartItem(productId);
          return;
        }
        set({
          items: get().items.map((entry) =>
            entry.productId === productId ? { ...entry, quantity: nextQuantity } : entry,
          ),
        });
        void setCartItem(productId, nextQuantity);
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
        void removeCartItem(productId);
      },
      clear: () => {
        set({ items: [] });
        void clearServerCart();
      },
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const stored = persisted as { items?: unknown } | undefined;
        const items = Array.isArray(stored?.items)
          ? stored.items.filter(isCartItem)
          : current.items;
        return { ...current, items };
      },
    },
  ),
);

export function useCart() {
  const items = useCartStore((state) => state.items);
  const ready = useCartStore((state) => state.ready);
  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const open = useCartStore((state) => state.open);
  const setOpen = useCartStore((state) => state.setOpen);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, count, ready, open, setOpen, addItem, setQuantity, removeItem, clear };
}

export function useCartLines(): CartLine[] {
  const items = useCartStore((state) => state.items);

  return items.map((item) => ({
    product: {
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    },
    quantity: item.quantity,
    lineTotal: item.price * item.quantity,
  }));
}
