"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/store/product-card";
import { MenuSelect } from "@/components/ui/menu-select";
import { categoriesFrom, type Product } from "@/lib/store/products";
import { cn } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc";

export function ShopCatalog({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const query = params.get("q")?.trim().toLowerCase() ?? "";
  const category = params.get("category") ?? "All";
  const [sort, setSort] = useState<Sort>("featured");
  const categories = useMemo(() => categoriesFrom(products), [products]);

  const filtered = useMemo(() => {
    const list = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      const matchesQuery = query.length === 0 || haystack.includes(query);
      return matchesCategory && matchesQuery;
    });

    if (sort === "price-asc") {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sort === "price-desc") {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [category, products, query, sort]);

  const filters = ["All", ...categories];

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-store-mist pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const href =
              filter === "All"
                ? query
                  ? `/shop?q=${encodeURIComponent(query)}`
                  : "/shop"
                : `/shop?category=${encodeURIComponent(filter)}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
            const active = filter === category || (filter === "All" && category === "All");
            return (
              <Link
                key={filter}
                href={href}
                className={cn(
                  "border px-3 py-1.5 text-sm",
                  active
                    ? "border-store-ink bg-store-ink text-store-sand"
                    : "border-store-mist bg-store-paper hover:border-store-ink",
                )}
              >
                {filter}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-sm text-store-ink/70">
          <span>Sort</span>
          <MenuSelect
            ariaLabel="Sort"
            value={sort}
            onValueChange={(next) => setSort(next as Sort)}
            className="w-52"
            options={[
              { value: "featured", label: "Featured" },
              { value: "price-asc", label: "Price, low to high" },
              { value: "price-desc", label: "Price, high to low" },
            ]}
          />
        </div>
      </div>

      {query ? (
        <p className="mt-6 text-sm text-store-ink/70">
          {filtered.length} result{filtered.length === 1 ? "" : "s"} for “{query}”
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-3xl">Nothing in the shop matches.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm underline">
            Clear the search
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
