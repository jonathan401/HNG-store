import { Suspense } from "react";
import { OrderList, parseOrderStatus } from "@/components/store/order-list";
import { listMyOrders } from "@/lib/dal/orders";

export const metadata = {
  title: "Orders · HNG Store",
};

async function Orders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await listMyOrders();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-store-clay">Account</p>
      <h1 className="mt-2 font-display text-5xl">Your orders</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-store-ink/70">
        Each order keeps what you bought, the delivery address, and whether payment is still open.
      </p>
      <OrderList
        orders={orders}
        hrefBase="/account/orders"
        status={parseOrderStatus(status)}
      />
    </div>
  );
}

export default function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16 sm:px-6" />}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}
