"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getServerCart } from "@/utils/actions/cart.action";
import { useCartStore } from "@/lib/store/cart";
import type { CartItem } from "@/lib/store/cart-item";

function withLocalEdits(server: CartItem[], before: CartItem[], after: CartItem[]) {
  const beforeQty = new Map(before.map((item) => [item.productId, item.quantity]));
  const afterById = new Map(after.map((item) => [item.productId, item]));
  const next = server.map((item) => {
    const current = afterById.get(item.productId);
    const previous = beforeQty.get(item.productId);
    if (current && previous !== undefined && current.quantity !== previous) return current;
    return item;
  });
  const seen = new Set(next.map((item) => item.productId));
  for (const item of after) {
    if (!beforeQty.has(item.productId) && !seen.has(item.productId)) next.push(item);
  }
  return next;
}

export function CartHydration() {
  useEffect(() => {
    let cancelled = false;
    let requestId = 0;

    const loadAccountCart = async () => {
      const id = ++requestId;
      const before = useCartStore.getState().items;
      useCartStore.getState().setSyncing(true);
      try {
        const server = await getServerCart();
        if (cancelled || id !== requestId || !server) return;
        const after = useCartStore.getState().items;
        useCartStore.getState().replaceItems(withLocalEdits(server, before, after));
      } catch {
        // Keep the bag already stored in this browser.
      } finally {
        if (!cancelled && id === requestId) {
          useCartStore.getState().setSyncing(false);
          useCartStore.getState().setReady(true);
        }
      }
    };

    let currentUserId: string | null | undefined;
    const supabase = createClient();

    const applyUser = (userId: string | null) => {
      if (cancelled || userId === currentUserId) return;
      const previous = currentUserId;
      currentUserId = userId;
      if (userId) {
        void loadAccountCart();
        return;
      }
      requestId += 1;
      if (previous) useCartStore.getState().replaceItems([]);
      useCartStore.getState().setSyncing(false);
      useCartStore.getState().setReady(true);
    };

    const start = () => {
      void supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        applyUser(data.session?.user.id ?? null);
      });
    };

    const unsubscribe = useCartStore.persist.onFinishHydration(start);
    void useCartStore.persist.rehydrate();
    if (useCartStore.persist.hasHydrated()) start();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (currentUserId === undefined) return;
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
      applyUser(session?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
