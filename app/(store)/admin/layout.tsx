import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

async function AdminFrame({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-store-clay">Admin</p>
      <div className="mt-4">
        <AdminNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6" />}>
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}
