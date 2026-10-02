import { Suspense } from "react";
import { CartDrawer } from "@/components/store/cart-drawer";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-store-sand text-store-ink">
      <p className="bg-store-moss px-4 py-2 text-center text-xs tracking-wide text-store-sand">
        Free delivery in Lagos on orders over ₦50,000
      </p>
      <SiteHeader />
      <Suspense fallback={null}>
        <CartDrawer />
      </Suspense>
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
