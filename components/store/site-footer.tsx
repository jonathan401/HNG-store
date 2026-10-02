import Link from "next/link";
import { Suspense } from "react";
import { OpenBagButton } from "@/components/store/cart-link";
import { categoriesFrom } from "@/lib/store/products";
import { getProducts } from "@/utils/actions/product.action";

function FooterLinks({ categories }: { categories: string[] }) {
  return (
    <footer className="mt-20 border-t border-store-mist">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl">HNG Store</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-store-ink/70">
            A small shop of goods for daily use, priced in naira.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-store-ink/50">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:underline">
                All goods
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category}>
                <Link href={`/shop?category=${encodeURIComponent(category)}`} className="hover:underline">
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-store-ink/50">Visit</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <OpenBagButton className="hover:underline">Your bag</OpenBagButton>
            </li>
            <li>
              <Link href="/checkout" className="hover:underline">
                Checkout
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:underline">
                Orders
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-store-mist py-4 text-center text-xs text-store-ink/50">
        HNG Store · Lagos
      </div>
    </footer>
  );
}

async function FooterContent() {
  let categories: string[] = [];
  try {
    categories = categoriesFrom(await getProducts());
  } catch {
    categories = [];
  }
  return <FooterLinks categories={categories} />;
}

export function SiteFooter() {
  return (
    <Suspense fallback={<FooterLinks categories={[]} />}>
      <FooterContent />
    </Suspense>
  );
}
