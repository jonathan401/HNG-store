import { Suspense } from "react";
import { AdminOrderTable } from "@/components/admin/order-table";
import { parseOrderStatus } from "@/components/store/order-list";
import { listAllOrders } from "@/lib/dal/orders";
import { ServiceRoleNotice } from "@/components/admin/service-role-notice";
import { hasServiceRole } from "@/lib/supabase/admin";

async function Orders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const orders = await listAllOrders();

  return (
    <div>
      <h1 className="font-display text-5xl">Orders</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-store-ink/70">
        Newest first. Open an order to change its status or record a payment.
      </p>
      <AdminOrderTable orders={orders} status={parseOrderStatus(status)} query={q ?? ""} />
    </div>
  );
}

export default function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  if (!hasServiceRole()) return <ServiceRoleNotice />;
  return (
    <Suspense fallback={<p className="text-sm">Loading orders…</p>}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}
