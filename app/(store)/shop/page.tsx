import { Suspense } from "react";
import { ShopCatalog } from "@/components/store/shop-catalog";
import { ProductGridSkeleton } from "@/components/store/skeletons";
import { getProducts } from "@/utils/actions/product.action";

export const metadata = {
  title: "Shop · HNG Store",
};

async function ShopResults() {
  try {
    const products = await getProducts();
    return <ShopCatalog products={products} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "The shop could not be loaded.";
    return <p className="text-sm text-destructive">{message}</p>;
  }
}

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-store-clay">The shop</p>
      <h1 className="mt-2 font-display text-5xl">Everything in stock</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-store-ink/70">
        Filter by shelf or search by name. Prices stay in naira.
      </p>
      <div className="mt-8">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopResults />
        </Suspense>
      </div>
    </div>
  );
}
