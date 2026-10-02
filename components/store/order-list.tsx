import Link from "next/link";
import { formatPrice } from "@/lib/store/products";
import type { OrderRecord, OrderStatus } from "@/lib/dal/types";
import { cn } from "@/lib/utils";

const statuses: OrderStatus[] = ["pending", "paid", "completed", "cancelled"];

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function formatWhen(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function orderCode(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function parseOrderStatus(
  value: string | undefined,
): OrderStatus | "all" {
  if (value && statuses.includes(value as OrderStatus))
    return value as OrderStatus;
  return "all";
}

export function orderStatusNote(status: OrderStatus) {
  if (status === "pending")
    return "Placed. Paystack still needs to confirm the payment.";
  if (status === "paid") return "Payment is in. The shop is getting it ready.";
  if (status === "completed") return "This order is finished.";
  return "This order was cancelled.";
}

function ordersHref(base: string, status: OrderStatus | "all", query: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}

function itemPreview(order: OrderRecord) {
  const pieces = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const pieceLabel = `${pieces} ${pieces === 1 ? "piece" : "pieces"}`;
  if (order.items.length === 0) return "No items recorded";
  const names = order.items.map((item) => item.name);
  const shown = names.slice(0, 2).join(", ");
  const extra = names.length > 2 ? ` +${names.length - 2}` : "";
  return `${pieceLabel} · ${shown}${extra}`;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-[11px] uppercase tracking-[0.14em]",
        status === "pending" && "bg-store-clay/15 text-store-clay",
        status === "paid" && "bg-store-moss/15 text-store-moss",
        status === "completed" && "bg-store-ink text-store-sand",
        status === "cancelled" && "bg-store-mist text-store-ink/60",
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

export function OrderList({
  orders,
  hrefBase,
  status = "all",
  query = "",
}: {
  orders: OrderRecord[];
  hrefBase: string;
  status?: OrderStatus | "all";
  query?: string;
}) {
  const needle = query.trim().toLowerCase();
  const visible = orders.filter((order) => {
    const matchesStatus = status === "all" || order.status === status;
    const haystack =
      `${order.customerName} ${order.customerEmail} ${orderCode(order.id)}`.toLowerCase();
    const matchesQuery = needle.length === 0 || haystack.includes(needle);
    return matchesStatus && matchesQuery;
  });

  const filters: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    ...statuses.map((value) => ({ value, label: statusLabel[value] })),
  ];

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const count =
              filter.value === "all"
                ? orders.length
                : orders.filter((order) => order.status === filter.value)
                    .length;
            const active = filter.value === status;
            return (
              <Link
                key={filter.value}
                href={ordersHref(hrefBase, filter.value, query)}
                className={cn(
                  "border px-3 py-1.5 text-sm",
                  active
                    ? "border-store-ink bg-store-ink text-store-sand"
                    : "border-store-mist bg-store-paper hover:border-store-ink",
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    active ? "text-store-sand/70" : "text-store-ink/50",
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 border border-store-mist bg-store-paper px-6 py-12">
          <p className="font-display text-3xl">No orders yet</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-store-ink/70">
            When you place an order, it shows up here with what you bought and
            where it stands.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center bg-store-ink px-5 text-sm text-store-sand"
          >
            Browse the shop
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm text-store-ink/70">
            Nothing matches this view.
          </p>
          <Link
            href={hrefBase}
            className="mt-3 inline-block text-sm underline underline-offset-4"
          >
            Show every order
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-store-mist border-y border-store-mist">
          {visible.map((order) => (
            <li key={order.id}>
              <Link
                href={`${hrefBase}/${order.id}`}
                className="grid gap-2 py-5 px-4 hover:bg-store-paper sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-xs uppercase tracking-[0.14em] text-store-ink/50">
                      {orderCode(order.id)} · {formatWhen(order.createdAt)}
                    </p>
                  </div>
                  <p className="mt-2 truncate text-sm text-store-ink/80">
                    {itemPreview(order)}
                  </p>
                </div>
                <p className="text-sm font-medium sm:text-right">
                  {formatPrice(order.total)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
