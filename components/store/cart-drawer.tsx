"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/store/product-image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice, FREE_DELIVERY_THRESHOLD } from "@/lib/store/products";
import { useCart, useCartLines } from "@/lib/store/cart";

export function CartDrawer() {
  const lines = useCartLines();
  const { ready, open, count, setOpen, setQuantity, removeItem } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("cart") !== "1") return;
    setOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("cart");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams, setOpen]);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const itemCount = ready ? count : 0;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close bag"
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-store-sand shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-store-mist px-5 py-4">
          <h2 id="cart-drawer-title" className="flex items-center gap-2 text-base font-medium">
            <ShoppingBag className="size-5" />
            Your bag ({itemCount})
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close bag"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-store-mist"
          >
            <X className="size-5" />
          </button>
        </div>

        {!ready || lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-3xl">Your bag is empty.</p>
            <p className="mt-3 max-w-xs text-sm text-store-ink/70">
              Browse the shop and add something you want to keep.
            </p>
            <Link
              href="/shop"
              onClick={(event) => {
                if (pathname === "/shop") {
                  event.preventDefault();
                  setOpen(false);
                }
              }}
              className="mt-6 text-sm underline underline-offset-4"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
              {lines.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3 bg-store-paper p-3">
                  <Link
                    href={`/products/${product.id}`}
                    onClick={(event) => {
                      if (pathname === `/products/${product.id}`) {
                        event.preventDefault();
                        setOpen(false);
                      }
                    }}
                    className="relative size-[4.5rem] shrink-0 overflow-hidden bg-store-mist"
                  >
                    <ProductImage src={product.image} alt="" sizes="72px" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product.id}`}
                      onClick={(event) => {
                        if (pathname === `/products/${product.id}`) {
                          event.preventDefault();
                          setOpen(false);
                        }
                      }}
                      className="block truncate text-sm font-medium uppercase tracking-wide"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm">{formatPrice(product.price)}</p>
                    <div className="mt-3 inline-flex items-center border border-store-mist">
                      <button
                        type="button"
                        aria-label={`Decrease ${product.name}`}
                        className="grid h-8 w-8 place-items-center"
                        onClick={() => setQuantity(product.id, quantity - 1)}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm">{quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${product.name}`}
                        className="grid h-8 w-8 place-items-center"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => removeItem(product.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center text-store-clay hover:text-store-ink"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-store-mist px-5 py-5">
              <div className="flex items-baseline justify-between">
                <p className="text-sm">Subtotal</p>
                <p className="text-xl font-medium">{formatPrice(subtotal)}</p>
              </div>
              <p className="mt-2 text-xs text-store-ink/60">
                {subtotal >= FREE_DELIVERY_THRESHOLD
                  ? "Delivery in Lagos is free on this order."
                  : "Delivery is added at checkout."}
              </p>
              <Link
                href="/checkout"
                className="mt-4 flex h-12 items-center justify-center bg-store-moss text-sm uppercase tracking-[0.14em] text-store-sand hover:bg-store-ink"
              >
                Proceed to checkout
              </Link>
              <Link
                href="/shop"
                onClick={(event) => {
                  if (pathname === "/shop") {
                    event.preventDefault();
                    setOpen(false);
                  }
                }}
                className="mt-4 block text-center text-sm underline-offset-4 hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
