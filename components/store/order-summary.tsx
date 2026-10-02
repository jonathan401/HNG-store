"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { ProductImage } from "@/components/store/product-image";
import {
  deliveryFee,
  formatPrice,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/store/products";
import { useCartLines, type CartLine } from "@/lib/store/cart";

export function OrderSummary({
  lines: linesProp,
  checkoutHref,
}: {
  lines?: CartLine[];
  checkoutHref?: string;
}) {
  const cartLines = useCartLines();
  const lines = linesProp ?? cartLines;
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = deliveryFee(subtotal);
  const total = subtotal + shipping;
  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  return (
    <aside className="h-fit border border-store-mist bg-store-paper p-5">
      <h2 className="flex items-center gap-2 font-display text-2xl">
        <Package className="size-5" aria-hidden />
        Order summary
      </h2>
      {lines.length > 0 ? (
        <ul className="mt-5 space-y-4">
          {lines.map((line) => (
            <li key={line.product.id} className="flex gap-3">
              <div className="relative size-16 shrink-0 bg-store-mist">
                <ProductImage src={line.product.image} alt={line.product.name} sizes="64px" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium uppercase tracking-wide">{line.product.name}</p>
                <p className="mt-1 text-xs text-store-ink/60">Qty: {line.quantity}</p>
                <p className="mt-1 text-sm font-medium">{formatPrice(line.lineTotal)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <dl className="mt-5 space-y-3 border-t border-store-mist pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-store-ink/70">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-store-ink/70">Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-store-mist pt-3 text-base">
          <dt className="font-medium">Total</dt>
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
