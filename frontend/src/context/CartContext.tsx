"use client";
/**
 * CartContext.tsx
 * Global cart state — persisted to localStorage.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Product } from "@/types";

export interface CartVariant {
  color?: string;
  size?: string;
  sku?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: CartVariant;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number, variant?: CartVariant) => void;
  removeItem: (productId: string, variant?: CartVariant) => void;
  updateQuantity: (productId: string, quantity: number, variant?: CartVariant) => void;
  clearCart: () => void;
  isInCart: (productId: string, variant?: CartVariant) => boolean;
  getItemQuantity: (productId: string, variant?: CartVariant) => number;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "tkp_cart";

/** Unique key per item (product + optional variant) */
function itemKey(productId: string, variant?: CartVariant) {
  return variant?.sku || variant?.color || variant?.size
    ? `${productId}__${variant.color || ""}__${variant.size || ""}`
    : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1, variant?: CartVariant) => {
    const key = itemKey(product._id, variant);
    setItems((prev) => {
      const existing = prev.find(
        (i) => itemKey(i.product._id, i.variant) === key,
      );
      if (existing) {
        return prev.map((i) =>
          itemKey(i.product._id, i.variant) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, quantity, variant }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variant?: CartVariant) => {
    const key = itemKey(productId, variant);
    setItems((prev) => prev.filter((i) => itemKey(i.product._id, i.variant) !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variant?: CartVariant) => {
    const key = itemKey(productId, variant);
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => itemKey(i.product._id, i.variant) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        itemKey(i.product._id, i.variant) === key ? { ...i, quantity } : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback((productId: string, variant?: CartVariant) => {
    return items.some((i) => itemKey(i.product._id, i.variant) === itemKey(productId, variant));
  }, [items]);

  const getItemQuantity = useCallback((productId: string, variant?: CartVariant) => {
    const item = items.find((i) => itemKey(i.product._id, i.variant) === itemKey(productId, variant));
    return item?.quantity ?? 0;
  }, [items]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, totalItems, subtotal,
      addItem, removeItem, updateQuantity, clearCart,
      isInCart, getItemQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
