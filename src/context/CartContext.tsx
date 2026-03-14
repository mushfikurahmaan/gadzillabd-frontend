'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { Product } from '@/types/product';
import type { CartItem } from '@/lib/cartDB';
import {
  getAllCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from '@/lib/cartDB';
import { syncPost } from '@/lib/api';

export interface CartNotification {
  productName: string;
  count: number;
  key: number;
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  totalPrice: number;
  notification: CartNotification | null;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearAll: () => Promise<void>;
  isInCart: (id: string) => boolean;
  dismissNotification: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notification, setNotification] = useState<CartNotification | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    getAllCartItems()
      .then((stored) => {
        setItems(stored);
      })
      .catch(() => {
        // IndexedDB not available (e.g. SSR), silently ignore
      })
      .finally(() => {
        setHydrated(true);
      });
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    await addCartItem(product, quantity);
    const existing = itemsRef.current.find((p) => p.id === product.id);
    const totalQty = existing ? existing.quantity + quantity : quantity;
    syncPost('/api/cart/add/', { product_id: product.id, quantity: totalQty });
    setItems((prev) => {
      const ex = prev.find((p) => p.id === product.id);
      if (ex) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: ex.quantity + quantity } : p
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setNotification({ productName: product.name, count: quantity, key: Date.now() });
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await removeCartItem(id);
    syncPost(`/api/cart/remove-by-product/${id}/`);
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity < 1) return;
    await updateCartItemQuantity(id, quantity);
    syncPost('/api/cart/add/', { product_id: id, quantity });
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity } : p))
    );
  }, []);

  const clearAll = useCallback(async () => {
    await clearCart();
    syncPost('/api/cart/clear/');
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (id: string) => items.some((p) => p.id === id),
    [items]
  );

  const count = items.reduce((sum, p) => sum + p.quantity, 0);

  const totalPrice = items.reduce((sum, p) => {
    const price = typeof p.price === 'string' ? Number(p.price) : p.price;
    return sum + (Number.isFinite(price) ? price * p.quantity : 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated,
        count,
        totalPrice,
        notification,
        addItem,
        removeItem,
        updateQuantity,
        clearAll,
        isInCart,
        dismissNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
