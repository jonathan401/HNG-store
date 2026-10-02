"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/lib/store/products";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem, setOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    addItem(product, quantity);
    setOpen(true);
  }

  if (soldOut) {
    return (
      <p className="mt-6 border border-store-mist px-4 py-3 text-sm text-store-ink/70">
        Sold out for now.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-medium">Quantity</p>
      <div className="flex w-fit items-center rounded-lg border border-store-mist">
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-l-lg hover:bg-store-mist"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
        >
          <Minus className="size-4" />
        </button>
        <span className="w-12 text-center text-sm font-medium" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-r-lg hover:bg-store-mist"
          aria-label="Increase quantity"
          onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
        >
          <Plus className="size-4" />
        </button>
      </div>
      <p className="mt-2 text-sm text-store-ink/60">{product.stock} in stock</p>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-store-moss text-sm text-store-sand hover:bg-store-ink"
      >
        <ShoppingBag className="size-5" />
        Add to bag
      </button>
    </div>
  );
}
