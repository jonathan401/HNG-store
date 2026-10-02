"use client";

import Link from "next/link";
import {
  deliveryFee,
  formatPrice,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/store/products";
import { useCartLines } from "@/lib/store/cart";

export function OrderSummary({
  checkoutHref,
}: {
  checkoutHref?: string;
}) {
  const lines = useCartLines();
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = deliveryFee(subtotal);
  const total = subtotal + shipping;
  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  return (
    <aside className="h-fit border border-store-mist bg-store-paper p-5">
      <h2 className="font-display text-2xl">Summary</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery in Lagos</dt>
          <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-store-mist pt-3 text-base">
          <dt>Total</dt>
          <dd className="font-medium">{formatPrice(total)}</dd>
        </div>
      </dl>
      {subtotal > 0 && remaining > 0 ? (
        <p className="mt-4 text-sm text-store-ink/70">
          Add {formatPrice(remaining)} for free delivery in Lagos.
        </p>
      ) : null}
      {subtotal > 0 && remaining <= 0 ? (
        <p className="mt-4 text-sm text-store-moss">Delivery in Lagos is free on this order.</p>
      ) : null}
      {checkoutHref && lines.length > 0 ? (
        <Link
          href={checkoutHref}
          className="mt-6 flex h-11 items-center justify-center bg-store-moss text-sm text-store-sand hover:bg-store-ink"
        >
          Checkout
        </Link>
      ) : null}
    </aside>
  );
}
