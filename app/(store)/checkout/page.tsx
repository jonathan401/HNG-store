import { Suspense } from "react";
import { CheckoutView } from "@/components/store/checkout-view";
import { CheckoutSkeleton } from "@/components/store/skeletons";
import { getViewer } from "@/lib/dal/session";

export const metadata = {
  title: "Checkout · HNG Store",
};

async function CheckoutGate({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const { payment } = await searchParams;
  const viewer = await getViewer();
  return (
    <CheckoutView
      signedIn={Boolean(viewer)}
      defaultEmail={viewer?.email ?? ""}
      paymentError={
        payment === "missing"
          ? "That Paystack payment could not be confirmed. Open the order and pay again."
          : ""
      }
    />
  );
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutGate searchParams={searchParams} />
    </Suspense>
  );
}
