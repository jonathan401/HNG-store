import Link from "next/link";
import { Suspense } from "react";
import { listAllOrders } from "@/lib/dal/orders";
import { listAllProducts } from "@/lib/dal/products";
import { ServiceRoleNotice } from "@/components/admin/service-role-notice";
import { hasServiceRole } from "@/lib/supabase/admin";

async function Overview() {
  const [products, orders] = await Promise.all([listAllProducts(), listAllOrders()]);
  const pending = orders.filter((order) => order.status === "pending").length;

  return (
    <div>
      <h1 className="font-display text-5xl">Shop desk</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/products" className="border border-store-mist bg-store-paper p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-store-ink/50">Products</p>
          <p className="mt-2 font-display text-4xl">{products.length}</p>
        </Link>
        <Link href="/admin/orders" className="border border-store-mist bg-store-paper p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-store-ink/50">Orders</p>
          <p className="mt-2 font-display text-4xl">{orders.length}</p>
        </Link>
        <Link href="/admin/orders?status=pending" className="border border-store-mist bg-store-paper p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-store-ink/50">Pending</p>
          <p className="mt-2 font-display text-4xl">{pending}</p>
        </Link>
      </div>
    </div>
  );
}

export default function AdminPage() {
  if (!hasServiceRole()) return <ServiceRoleNotice />;
  return (
    <Suspense fallback={<p className="text-sm">Loading the desk…</p>}>
      <Overview />
    </Suspense>
  );
}
