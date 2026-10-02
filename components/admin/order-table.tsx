import Link from "next/link";
import {
  formatWhen,
  orderCode,
  OrderStatusBadge,
  parseOrderStatus,
} from "@/components/store/order-list";
import type { OrderRecord, OrderStatus, PaymentStatus } from "@/lib/dal/types";
import { formatPrice } from "@/lib/store/products";
import { cn } from "@/lib/utils";

const statuses: OrderStatus[] = ["pending", "paid", "completed", "cancelled"];

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  completed: "Completed",
  cancelled: "Cancelled",
};

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

function ordersHref(status: OrderStatus | "all", query: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/admin/orders?${search}` : "/admin/orders";
}

function itemSummary(order: OrderRecord) {
  const pieces = order.items.reduce((sum, item) => sum + item.quantity, 0);
  if (order.items.length === 0) return "No items recorded";
  const names = order.items.map((item) => item.name);
  const shown = names.slice(0, 2).join(", ");
  const extra = names.length > 2 ? ` +${names.length - 2}` : "";
  return `${pieces} ${pieces === 1 ? "piece" : "pieces"} · ${shown}${extra}`;
}

function paymentSummary(order: OrderRecord) {
  if (order.payments.length === 0) return "Pay on delivery";
  return order.payments
    .map(
      (payment) =>
        `${providerLabel[payment.provider] ?? payment.provider} · ${paymentStatusLabel[payment.status]}`,
    )
    .join(", ");
}

export function AdminOrderTable({
  orders,
  status = "all",
  query = "",
}: {
  orders: OrderRecord[];
  status?: OrderStatus | "all";
  query?: string;
}) {
  const activeStatus = parseOrderStatus(status === "all" ? undefined : status);
  const needle = query.trim().toLowerCase();
  const visible = orders.filter((order) => {
    const matchesStatus = activeStatus === "all" || order.status === activeStatus;
    const haystack = `${order.customerName} ${order.customerEmail} ${orderCode(order.id)} ${order.items
      .map((item) => item.name)
      .join(" ")}`.toLowerCase();
    return matchesStatus && (needle.length === 0 || haystack.includes(needle));
  });

  const filters: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    ...statuses.map((value) => ({ value, label: statusLabel[value] })),
  ];

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const count =
              filter.value === "all"
                ? orders.length
                : orders.filter((order) => order.status === filter.value).length;
            const active = filter.value === activeStatus;
            return (
              <Link
                key={filter.value}
                href={ordersHref(filter.value, query)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "border px-3 py-1.5 text-sm",
                  active
                    ? "border-store-ink bg-store-ink text-store-sand"
                    : "border-store-mist bg-store-paper hover:border-store-ink",
                )}
              >
                {filter.label}
                <span className={cn("ml-1.5 text-xs", active ? "text-store-sand/70" : "text-store-ink/50")}>
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
        <form action="/admin/orders" className="flex gap-2">
          {activeStatus !== "all" ? <input type="hidden" name="status" value={activeStatus} /> : null}
          <input
            name="q"
            defaultValue={query}
            placeholder="Name, email, item, or code"
            className="h-10 w-full border border-store-mist bg-store-paper px-3 text-sm outline-none ring-store-moss focus:ring-1 sm:w-64"
          />
          <button type="submit" className="h-10 shrink-0 bg-store-ink px-4 text-sm text-store-sand">
            Search
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 border border-store-mist bg-store-paper px-6 py-12">
          <p className="font-display text-3xl">No orders yet</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-store-ink/70">
            Orders placed at checkout will show up here.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm text-store-ink/70">Nothing matches this view.</p>
          <Link href="/admin/orders" className="mt-3 inline-block text-sm underline underline-offset-4">
            Show every order
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-store-ink/50">
              <tr>
                <th className="py-2 pr-4 font-medium">Order</th>
                <th className="py-2 pr-4 font-medium">Customer</th>
                <th className="py-2 pr-4 font-medium">Items</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Payment</th>
                <th className="py-2 pr-4 font-medium">Placed</th>
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="border-t border-store-mist align-top">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {orderCode(order.id)}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <p>{order.customerName}</p>
                    <p className="text-store-ink/60">{order.customerEmail}</p>
                  </td>
                  <td className="max-w-xs py-3 pr-4 text-store-ink/80">{itemSummary(order)}</td>
                  <td className="py-3 pr-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 pr-4 text-store-ink/80">{paymentSummary(order)}</td>
                  <td className="whitespace-nowrap py-3 pr-4 text-store-ink/70">
                    {formatWhen(order.createdAt)}
                  </td>
                  <td className="whitespace-nowrap py-3 text-right font-medium">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
