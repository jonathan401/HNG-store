"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/store/product-image";
import { formatPrice, type Product } from "@/lib/store/products";
import { useCart } from "@/lib/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items, setOpen } = useCart();
  const [added, setAdded] = useState(false);
  const inBag = items.find((item) => item.productId === product.id);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    addItem(product, 1);
    setOpen(true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="group flex flex-col">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-store-mist">
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="transition-transform duration-500 linear group-hover:scale-110"
          />
          {product.badge ? (
            <span className="absolute left-3 top-3 bg-store-paper px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-store-ink">
              {product.badge}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl leading-tight">{product.name}</h3>
          <p className="shrink-0 text-sm">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-store-ink/60">
          {product.category}
        </p>
      </Link>
      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        className="mt-3 self-start text-sm underline decoration-store-mist underline-offset-4 transition hover:decoration-store-clay disabled:no-underline disabled:opacity-60"
      >
        {soldOut
          ? "Sold out"
          : added
            ? "Added to bag"
            : inBag
              ? `In bag · ${inBag.quantity}`
              : "Add to bag"}
      </button>
    </article>
  );
}
