import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { getProductRecord } from "@/lib/dal/products";
import { removeProduct } from "@/utils/actions/admin.action";
import { ServiceRoleNotice } from "@/components/admin/service-role-notice";
import { hasServiceRole } from "@/lib/supabase/admin";

async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductRecord(id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-5xl">Edit product</h1>
      <ProductForm product={product} />
      <form action={removeProduct} className="mt-10">
        <input type="hidden" name="id" value={product.id} />
        <button type="submit" className="text-sm text-store-clay underline">
          Remove from catalog
        </button>
      </form>
    </div>
  );
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasServiceRole()) return <ServiceRoleNotice />;
  return (
    <Suspense fallback={<p className="text-sm">Loading product…</p>}>
      <EditProduct params={params} />
    </Suspense>
  );
}
