import Link from "next/link";
import { Suspense } from "react";
import { HeroBanner, type Slide } from "@/components/store/hero-banner";
import { HomeSkeleton } from "@/components/store/skeletons";
import { ProductCard } from "@/components/store/product-card";
import { ProductImage } from "@/components/store/product-image";
import { categoriesFrom, type Product } from "@/lib/store/products";
import { getProducts } from "@/utils/actions/product.action";

const introImage =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80";

function excerpt(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 140) return clean;
  return `${clean.slice(0, 137).trimEnd()}…`;
}

function slidesFor(products: Product[]): Slide[] {
  const available = products.filter((product) => product.image && product.stock > 0);
  const featuredProducts: Product[] = [];
  const used = new Set<string>();

  for (const product of available) {
    if (used.has(product.image)) continue;
    used.add(product.image);
    featuredProducts.push(product);
    if (featuredProducts.length === 4) break;
  }

  const featured: Slide[] = featuredProducts.map((product) => ({
    image: product.image,
    alt: product.name,
    kicker: product.category,
    title: product.name,
    copy: excerpt(product.description) || "In stock now.",
    href: `/products/${product.id}`,
    cta: "Shop now",
  }));

  const spare =
    available.find((product) => !used.has(product.image))?.image ||
    (used.has(introImage) ? "" : introImage);

  if (!spare) return featured;

  return [
    {
      image: spare,
      alt: "Goods on display",
      kicker: "A small shop in Lagos",
      title: "Goods for the ordinary day.",
      emphasis: "ordinary",
      copy: "Headphones, linen, a lamp, a notebook. Whatever is in stock today.",
      href: "/shop",
      cta: "Browse the shop",
    },
    ...featured,
  ];
}

async function HomeContent() {
  let products: Product[] = [];
  let error = "";
  try {
    products = await getProducts();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "The shop could not be loaded.";
  }

  const categories = categoriesFrom(products);
  const covers = categories.map((category) => ({
    category,
    product: products.find((product) => product.category === category)!,
  }));

  return (
    <div>
      <HeroBanner slides={slidesFor(products)} />

      {error ? (
        <p className="mx-auto max-w-6xl px-4 pt-10 text-sm text-destructive sm:px-6">{error}</p>
      ) : null}

      {covers.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl">Shelves</h2>
            <Link href="/shop" className="text-sm underline underline-offset-4">
              All goods
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {covers.map(({ category, product }) => (
              <Link
                key={category}
                href={`/shop?category=${encodeURIComponent(category)}`}
                className="group relative aspect-[3/4] overflow-hidden bg-store-mist"
              >
                <ProductImage src={product.image} alt="" sizes="(min-width: 1024px) 25vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <p className="absolute bottom-4 left-4 font-display text-3xl text-white">{category}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-4xl">Now in stock</h2>
        {products.length === 0 ? (
          <p className="mt-6 max-w-md text-sm leading-relaxed text-store-ink/70">
            Nothing is on the shelf yet. An admin can add products from the catalog.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl items-center gap-8 px-4 sm:px-6 md:grid-cols-2">
        <div className="relative aspect-[5/4] bg-store-mist">
          <ProductImage
            src={products[3]?.image || products[0]?.image || introImage}
            alt={products[3]?.name || products[0]?.name || "Shop goods"}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="md:px-6">
          <p className="text-xs uppercase tracking-[0.18em] text-store-clay">How a visit works</p>
          <ol className="mt-4 space-y-5">
            {[
              ["01", "Choose a piece", "Open a product, read what it actually is, and decide."],
              ["02", "Keep a bag", "Signed-in bags are saved to your account. Guests keep theirs in this browser."],
              ["03", "Leave an address", "Checkout saves the order. Payment is confirmed after you place it."],
            ].map(([index, title, copy]) => (
              <li key={index} className="grid grid-cols-[auto_1fr] gap-4">
                <span className="font-display text-2xl text-store-clay">{index}</span>
                <div>
                  <p className="font-display text-2xl">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-store-ink/70">{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
