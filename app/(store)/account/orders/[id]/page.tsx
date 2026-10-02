import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatWhen, orderCode, orderStatusNote } from "@/components/store/order-list";
import { OrderReceipt } from "@/components/store/order-receipt";
import { getMyOrder } from "@/lib/dal/orders";

async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getMyOrder(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/account/orders" className="text-sm underline underline-offset-4">
        All orders
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.16em] text-store-clay">{order.status}</p>
      <h1 className="mt-2 font-display text-4xl">Order {orderCode(order.id)}</h1>
      <p className="mt-2 text-sm text-store-ink/70">{formatWhen(order.createdAt)}</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-store-ink/70">{orderStatusNote(order.status)}</p>
      <div className="mt-8">
        <OrderReceipt order={order} linkProducts />
      </div>
    </div>
  );
}

export default function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16 sm:px-6" />}>
      <OrderDetails params={params} />
    </Suspense>
  );
}
