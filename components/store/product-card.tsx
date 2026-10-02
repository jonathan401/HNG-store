import Link from "next/link";
import { ProductImage } from "@/components/store/product-image";
import { formatPrice, type Product } from "@/lib/store/products";

export function ProductCard({ product }: { product: Product }) {
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
    </article>
  );
}
