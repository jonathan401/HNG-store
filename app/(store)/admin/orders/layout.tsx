import { Suspense } from "react";
import { ScrollToTop } from "@/components/store/scroll-to-top";

export default function AdminOrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      {children}
    </>
  );
}
