import Link from "next/link";
import { Suspense } from "react";
import { listAllProducts } from "@/lib/dal/products";
import { asMoney } from "@/lib/dal/types";
import { formatPrice } from "@/lib/store/products";
import { AdminTableSkeleton } from "@/components/store/skeletons";
import { ServiceRoleNotice } from "@/components/admin/service-role-notice";
import { hasServiceRole } from "@/lib/supabase/admin";

async function ProductTable() {
  const products = await listAllProducts();

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-5xl">Products</h1>
        <Link href="/admin/products/new" className="bg-store-moss px-4 py-2 text-sm text-store-sand">
          New product
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="mt-8 text-sm text-store-ink/70">No products yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-store-ink/50">
              <tr>
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 font-medium">Price</th>
                <th className="py-2 font-medium">Stock</th>
                <th className="py-2 font-medium">Shop</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-store-mist">
                  <td className="py-3">
                    <Link href={`/admin/products/${product.id}`} className="underline-offset-4 hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3">{product.category || "—"}</td>
                  <td className="py-3">{formatPrice(asMoney(product.price))}</td>
                  <td className="py-3">{product.stock}</td>
                  <td className="py-3">{product.is_active ? "Visible" : "Hidden"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  if (!hasServiceRole()) return <ServiceRoleNotice />;
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <ProductTable />
    </Suspense>
  );
}
