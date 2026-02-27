'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Product } from '@/types/product';
import {
  getAllWishlistItems,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
} from '@/lib/wishlistDB';

export interface WishlistNotification {
  productName: string;
  key: number;
}

interface WishlistContextValue {
  items: Product[];
  hydrated: boolean;
  count: number;
  notification: WishlistNotification | null;
  addItem: (product: Product) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  toggleItem: (product: Product) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  clearAll: () => Promise<void>;
  dismissNotification: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notification, setNotification] = useState<WishlistNotification | null>(null);

  useEffect(() => {
    getAllWishlistItems()
      .then((stored) => {
        setItems(stored);
      })
      .catch(() => {
        // IndexedDB not available (e.g. SSR safety), silently ignore
      })
      .finally(() => {
        setHydrated(true);
      });
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const addItem = useCallback(async (product: Product) => {
    await addWishlistItem(product);
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
    setNotification({ productName: product.name, key: Date.now() });
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await removeWishlistItem(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleItem = useCallback(
    async (product: Product) => {
      const exists = items.some((p) => p.id === product.id);
      if (exists) {
        await removeItem(product.id);
      } else {
        await addItem(product);
      }
    },
    [items, addItem, removeItem]
  );

  const isInWishlist = useCallback(
    (id: string) => items.some((p) => p.id === id),
    [items]
  );

  const clearAll = useCallback(async () => {
    await clearWishlist();
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        hydrated,
        count: items.length,
        notification,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        clearAll,
        dismissNotification,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used inside WishlistProvider');
  }
  return ctx;
}
