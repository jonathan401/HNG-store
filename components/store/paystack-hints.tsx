import { PAYSTACK_SCRIPT } from "@/lib/store/paystack-script";

export function PaystackHints() {
  return (
    <>
      <link rel="preconnect" href="https://js.paystack.co" />
      <link rel="preconnect" href="https://checkout.paystack.com" />
      <link rel="preload" href={PAYSTACK_SCRIPT} as="script" />
    </>
  );
}
