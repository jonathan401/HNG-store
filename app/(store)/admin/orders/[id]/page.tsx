import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatWhen, orderCode, orderStatusNote } from "@/components/store/order-list";
import { OrderReceipt } from "@/components/store/order-receipt";
import { getAnyOrder } from "@/lib/dal/orders";
import { formatPrice } from "@/lib/store/products";
import { saveOrderStatus, savePaymentStatus } from "@/utils/actions/admin.action";
import type { OrderStatus, PaymentStatus } from "@/lib/dal/types";
import { MenuSelect } from "@/components/ui/menu-select";
import { ServiceRoleNotice } from "@/components/admin/service-role-notice";
import { hasServiceRole } from "@/lib/supabase/admin";

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
const paymentStatuses: { value: PaymentStatus; label: string }[] = [
  { value: "initiated", label: "Started" },
  { value: "success", label: "Received" },
  { value: "failed", label: "Failed" },
];

async function OrderEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAnyOrder(id);
  if (!order) notFound();

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
      <div>
        <Link href="/admin/orders" className="text-sm underline underline-offset-4">
          All orders
        </Link>
        <p className="mt-6 text-xs uppercase tracking-[0.16em] text-store-ink/50">
          {formatWhen(order.createdAt)}
        </p>
        <h1 className="mt-2 font-display text-4xl">Order {orderCode(order.id)}</h1>
        <p className="mt-2 text-sm text-store-ink/70">{orderStatusNote(order.status)}</p>
        <p className="mt-1 text-sm text-store-ink/60">
          {order.emailSent ? "Confirmation email sent." : "Confirmation email not sent."}
        </p>
        <div className="mt-8">
          <OrderReceipt order={order} />
        </div>
        <div className="mt-8 space-y-4">
          {order.payments.length === 0 ? (
            <p className="text-sm text-store-ink/70">No payment recorded. This order is pay on delivery.</p>
          ) : (
            order.payments.map((payment) => (
              <form key={payment.id} action={savePaymentStatus} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={payment.id} />
                <input type="hidden" name="order_id" value={order.id} />
                <div className="min-w-44 text-sm">
                  <p>
                    {payment.provider} · {formatPrice(payment.amount)}
                  </p>
                  <MenuSelect
                    name="status"
                    ariaLabel={`${payment.provider} payment status`}
                    defaultValue={payment.status}
                    options={paymentStatuses}
                    className="mt-2"
                  />
                </div>
                <button type="submit" className="h-10 bg-store-ink px-4 text-sm text-store-sand">
                  Update payment
                </button>
              </form>
            ))
          )}
        </div>
      </div>
      <form action={saveOrderStatus} className="h-fit border border-store-mist bg-store-paper p-5">
        <input type="hidden" name="id" value={order.id} />
        <p className="font-display text-2xl">Status</p>
        <p className="mt-2 text-sm">Total {formatPrice(order.total)}</p>
        <MenuSelect
          name="status"
          ariaLabel="Order status"
          defaultValue={order.status}
          options={orderStatuses}
          className="mt-4 bg-store-sand"
        />
        <button type="submit" className="mt-4 h-10 w-full bg-store-moss text-sm text-store-sand">
          Save status
        </button>
      </form>
    </div>
  );
}

export default function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasServiceRole()) return <ServiceRoleNotice />;
  return (
    <Suspense fallback={<p className="text-sm">Loading order…</p>}>
      <OrderEditor params={params} />
    </Suspense>
  );
}
