import Link from "next/link";

export const metadata = {
  title: "Contact us · HNG Store",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-store-clay">The desk</p>
      <h1 className="mt-2 font-display text-5xl">Contact us</h1>
      <div className="mt-8 grid max-w-3xl gap-10 md:grid-cols-2">
        <div className="space-y-5 text-sm leading-relaxed text-store-ink/80">
          <p>The shop is in Lagos. Questions about a piece, a bag, or a delivery come to this desk.</p>
          <p>
            If you already placed an order, the fastest record is on your account. Include the
            order number when you write.
          </p>
        </div>
        <div className="border border-store-mist bg-store-paper p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-store-ink/50">Visit</p>
          <p className="mt-3 font-display text-2xl">Lagos</p>
          <p className="mt-2 text-sm text-store-ink/70">Free delivery in the city on orders over ₦50,000.</p>
          <Link href="/account/orders" className="mt-6 inline-block text-sm underline underline-offset-4">
            Your orders
          </Link>
        </div>
      </div>
    </div>
  );
}
