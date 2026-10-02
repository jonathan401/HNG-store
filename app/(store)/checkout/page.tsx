import { Suspense } from "react";
import { CheckoutView } from "@/components/store/checkout-view";
import { getViewer } from "@/lib/dal/session";

export const metadata = {
  title: "Checkout · HNG Store",
};

async function CheckoutGate() {
  const viewer = await getViewer();
  return <CheckoutView signedIn={Boolean(viewer)} defaultEmail={viewer?.email ?? ""} />;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6" />}>
      <CheckoutGate />
    </Suspense>
  );
}
