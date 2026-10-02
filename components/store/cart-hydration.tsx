"use client";

import { useEffect } from "react";
import { getServerCart, setCartItem } from "@/utils/actions/cart.action";
import { useCartStore } from "@/lib/store/cart";

export function CartHydration() {
  useEffect(() => {
    let cancelled = false;
    let started = false;

    const finish = async () => {
      if (started || cancelled) return;
      started = true;
      try {
        const local = useCartStore.getState().items;
        const server = await getServerCart();
        if (cancelled || !server) return;

        const ids = new Set(server.map((item) => item.productId));
        const extras = local.filter((item) => !ids.has(item.productId));
        for (const item of extras) {
          void setCartItem(item.productId, item.quantity);
        }
        useCartStore.getState().replaceItems([...server, ...extras]);
      } catch {
        // Keep the bag that is already in this browser.
      } finally {
        if (!cancelled) useCartStore.getState().setReady(true);
      }
    };

    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      void finish();
    });
    void useCartStore.persist.rehydrate();
    if (useCartStore.persist.hasHydrated()) void finish();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return null;
}
