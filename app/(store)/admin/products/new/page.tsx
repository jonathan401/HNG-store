import { ProductForm } from "@/components/admin/product-form";
import { ServiceRoleNotice } from "@/components/admin/service-role-notice";
import { hasServiceRole } from "@/lib/supabase/admin";

export default function NewProductPage() {
  if (!hasServiceRole()) return <ServiceRoleNotice />;
  return (
    <div>
      <h1 className="font-display text-5xl">New product</h1>
      <ProductForm />
    </div>
  );
}
