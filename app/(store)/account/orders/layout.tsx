import { Suspense } from "react";
import { PaystackHints } from "@/components/store/paystack-hints";
import { ScrollToTop } from "@/components/store/scroll-to-top";

export default function AccountOrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PaystackHints />
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      {children}
    </>
  );
}
