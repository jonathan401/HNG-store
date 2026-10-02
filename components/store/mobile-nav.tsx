"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useCart } from "@/lib/store/cart";

export function MobileNav({
  categories,
  email,
  isAdmin,
}: {
  categories: string[];
  email: string | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const setCartOpen = useCart().setOpen;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="grid h-10 w-10 place-items-center"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-16 z-40 border-b border-store-mist bg-store-sand px-4 py-4 shadow-sm">
          <form action="/shop" className="mb-4 md:hidden">
            <label className="block text-xs uppercase tracking-[0.16em] text-store-ink/60">
              Search
              <input
                name="q"
                placeholder="Search the shop"
                className="mt-2 h-11 w-full border border-store-mist bg-store-paper px-3 text-sm outline-none ring-store-moss focus:ring-1"
              />
            </label>
          </form>
          <nav className="flex flex-col gap-3 text-lg">
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden">
                Our collections
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2 flex flex-col gap-2 border-l border-store-mist pl-3 text-base">
                <Link href="/shop" onClick={() => setOpen(false)}>
                  All goods
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/shop?category=${encodeURIComponent(category)}`}
                    onClick={() => setOpen(false)}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/about" onClick={() => setOpen(false)}>
              About us
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact us
            </Link>
            <button
              type="button"
              className="text-left"
              onClick={() => {
                setOpen(false);
                setCartOpen(true);
              }}
            >
              Bag
            </button>
            <Link href={email ? "/account/orders" : "/auth/login"} onClick={() => setOpen(false)}>
              {email ? "Orders" : "Sign in"}
            </Link>
            {isAdmin ? (
              <Link href="/admin" onClick={() => setOpen(false)}>
                Admin
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
