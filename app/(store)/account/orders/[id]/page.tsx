import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckoutSteps } from "@/components/store/checkout-steps";
import { formatWhen, orderCode, orderStatusNote } from "@/components/store/order-list";
import { OrderReceipt } from "@/components/store/order-receipt";
import { PaystackPayButton } from "@/components/store/paystack-pay-button";
import { OrderDetailSkeleton } from "@/components/store/skeletons";
import { getMyOrder } from "@/lib/dal/orders";

function paymentNotice(payment: string | undefined) {
  if (payment === "paid") return "Paystack confirmed this payment.";
  if (payment === "failed") return "Paystack did not confirm the payment. You can try again.";
  if (payment === "pending") return "Paystack is still confirming this payment.";
  return "";
}

async function OrderDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;
  const order = await getMyOrder(id);
  if (!order) notFound();
  const paid = order.payments.some((item) => item.status === "success");
  const canPay = order.status === "pending" && !paid;
  const notice = paymentNotice(payment);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {payment ? (
        <div className="mb-8">
          <CheckoutSteps current={payment === "paid" ? "confirmation" : "payment"} />
        </div>
      ) : null}
      <Link href="/account/orders" className="text-sm underline underline-offset-4">
        All orders
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.16em] text-store-clay">{order.status}</p>
      <h1 className="mt-2 font-display text-4xl">Order {orderCode(order.id)}</h1>
      <p className="mt-2 text-sm text-store-ink/70">{formatWhen(order.createdAt)}</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-store-ink/70">{orderStatusNote(order.status)}</p>
      {notice ? <p className="mt-4 text-sm text-store-ink">{notice}</p> : null}
      {payment === "failed" && order.status === "cancelled" ? (
        <p className="mt-4 text-sm text-store-ink">
          These items are still in your bag.{" "}
          <Link href="/shop?cart=1" className="underline">
            Open your bag
          </Link>
        </p>
      ) : null}
      {canPay ? (
        <div className="mt-6">
          <PaystackPayButton orderId={order.id} />
        </div>
      ) : null}
      <div className="mt-8">
        <OrderReceipt order={order} linkProducts />
      </div>
    </div>
  );
}

export default function AccountOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetails params={params} searchParams={searchParams} />
    </Suspense>
  );
}
