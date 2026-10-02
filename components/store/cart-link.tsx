"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart";

export function CartLink() {
  const { count, ready, setOpen } = useCart();
  const shown = ready ? count : 0;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={
        shown === 0 ? "Bag, empty" : `Bag, ${shown} ${shown === 1 ? "item" : "items"}`
      }
      className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-store-mist"
    >
      <ShoppingBag className="size-5" />
      {shown > 0 ? (
        <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-store-clay px-1 text-[11px] text-white">
          {shown}
        </span>
      ) : null}
    </button>
  );
}

export function OpenBagButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { setOpen } = useCart();

  return (
    <button type="button" className={className} onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}
