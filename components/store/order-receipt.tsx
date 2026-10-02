import Link from "next/link";
import { formatPrice } from "@/lib/store/products";
import type { OrderRecord, PaymentStatus } from "@/lib/dal/types";

const paymentStatusLabel: Record<PaymentStatus, string> = {
  initiated: "Started",
  success: "Received",
  failed: "Failed",
};

const providerLabel: Record<string, string> = {
  paystack: "Paystack",
  flutterwave: "Flutterwave",
  stripe: "Stripe",
};

function moneyParts(order: OrderRecord) {
  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return {
    subtotal,
    delivery: Math.max(0, order.total - subtotal),
  };
}

export function OrderReceipt({
  order,
  linkProducts = false,
}: {
  order: OrderRecord;
  linkProducts?: boolean;
}) {
  const { subtotal, delivery } = moneyParts(order);

  return (
    <div>
      <ul className="divide-y divide-store-mist border-y border-store-mist">
        {order.items.length === 0 ? (
          <li className="py-4 text-sm text-store-ink/70">No items were saved with this order.</li>
        ) : (
          order.items.map((item) => {
            const line = (
              <>
                <span>
                  {item.name}
                  <span className="mt-1 block text-xs text-store-ink/50">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </span>
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </>
            );
            return (
              <li key={item.id} className="flex items-start justify-between gap-4 py-4 text-sm">
                {linkProducts && item.productId ? (
                  <Link href={`/products/${item.productId}`} className="flex flex-1 justify-between gap-4 hover:underline">
                    {line}
                  </Link>
                ) : (
                  <div className="flex flex-1 justify-between gap-4">{line}</div>
                )}
              </li>
            );
          })
        )}
      </ul>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-store-ink/70">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-store-ink/70">Delivery</dt>
          <dd>{delivery === 0 ? "Free" : formatPrice(delivery)}</dd>
        </div>
        <div className="flex justify-between border-t border-store-mist pt-3 text-base">
          <dt>Total</dt>
          <dd className="font-medium">{formatPrice(order.total)}</dd>
        </div>
      </dl>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-store-ink/50">Deliver to</p>
          <p className="mt-2 text-sm">
            {order.customerName}
            <br />
            {order.customerEmail}
            {order.customerPhone ? (
              <>
                <br />
                {order.customerPhone}
              </>
            ) : null}
          </p>
          {order.deliveryAddress ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-store-ink/80">
              {order.deliveryAddress}
            </p>
          ) : (
            <p className="mt-2 text-sm text-store-ink/60">No address was saved.</p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-store-ink/50">Payment</p>
          {order.payments.length === 0 ? (
            <p className="mt-2 text-sm text-store-ink/80">Pay on delivery.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {order.payments.map((payment) => (
                <li key={payment.id}>
                  {providerLabel[payment.provider] ?? payment.provider} · {paymentStatusLabel[payment.status]} ·{" "}
                  {formatPrice(payment.amount)}
                  {payment.reference ? (
                    <span className="mt-1 block text-xs text-store-ink/50">{payment.reference}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
