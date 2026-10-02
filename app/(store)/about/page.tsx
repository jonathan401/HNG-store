import Link from "next/link";

export const metadata = {
  title: "About us · HNG Store",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-store-clay">The shop</p>
      <h1 className="mt-2 font-display text-5xl">About us</h1>
      <div className="mt-8 max-w-2xl space-y-5 text-sm leading-relaxed text-store-ink/80">
        <p>
          HNG Store is a small shop in Lagos. The shelves hold goods for an ordinary day:
          headphones, linen, a lamp, a notebook, whatever is in stock.
        </p>
        <p>
          Prices stay in naira. A signed-in bag is saved to your account. A guest bag stays in
          this browser until you check out and leave an address.
        </p>
        <p>
          Free delivery in Lagos starts on orders over ₦50,000. Payment is confirmed after you
          place the order.
        </p>
      </div>
      <Link href="/shop" className="mt-8 inline-block text-sm underline underline-offset-4">
        Browse the shop
      </Link>
    </div>
  );
}
