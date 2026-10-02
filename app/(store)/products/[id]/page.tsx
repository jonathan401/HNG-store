import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RotateCcw, Shield, Truck } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { ProductImage } from "@/components/store/product-image";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductDetailSkeleton } from "@/components/store/skeletons";
import {
  formatPrice,
  FREE_DELIVERY_THRESHOLD,
  relatedProducts,
} from "@/lib/store/products";
import { getProduct, getProducts } from "@/utils/actions/product.action";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProduct(id);
    if (!product) return { title: "Not found · HNG Store" };
    return {
      title: `${product.name} · HNG Store`,
      description: product.description,
    };
  } catch {
    return { title: "HNG Store" };
  }
}

async function ProductDetails({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  let product: Awaited<ReturnType<typeof getProduct>> = null;
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    [product, products] = await Promise.all([getProduct(id), getProducts()]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "This product could not be loaded.";
    return <p className="mx-auto max-w-6xl px-4 py-16 text-sm text-destructive sm:px-6">{message}</p>;
  }
  if (!product) notFound();
  const related = relatedProducts(products, product);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="grid items-start gap-8 md:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-store-mist">
          <ProductImage src={product.image} alt={product.name} priority sizes="(min-width: 768px) 50vw, 100vw" />
          {product.badge ? (
            <span className="absolute left-4 top-4 rounded bg-store-clay px-3 py-1 text-sm font-medium text-white">
              {product.badge}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.18em] text-store-clay">{product.category}</p>
          <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-medium">{formatPrice(product.price)}</p>
          {product.description ? (
            <p className="mt-4 leading-relaxed text-store-ink/70">{product.description}</p>
          ) : null}
          <ProductPurchase product={product} />
          <div className="mt-8 space-y-4 border-t border-store-mist pt-6">
            <p className="flex items-center gap-3 text-sm text-store-ink/70">
              <Truck className="size-5 shrink-0" />
              Free delivery in Lagos on orders over {formatPrice(FREE_DELIVERY_THRESHOLD)}
            </p>
            <p className="flex items-center gap-3 text-sm text-store-ink/70">
              <RotateCcw className="size-5 shrink-0" />
              Returns within 30 days if it is unused
            </p>
            <p className="flex items-center gap-3 text-sm text-store-ink/70">
              <Shield className="size-5 shrink-0" />
              Pay with Paystack at checkout
            </p>
          </div>
        </div>
      </div>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-3xl">Same shelf</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function ProductPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}
