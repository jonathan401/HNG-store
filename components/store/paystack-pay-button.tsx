"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { openPaystackCheckout, preloadPaystack } from "@/lib/store/paystack-popup";
import { startPaystackPayment } from "@/utils/actions/order.action";

export function PaystackPayButton({ orderId }: { orderId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    preloadPaystack();
  }, []);

  async function pay() {
    setPending(true);
    setError("");
    const result = await startPaystackPayment(orderId);
    if ("error" in result) {
      setError(result.error ?? "Could not open Paystack.");
      setPending(false);
      return;
    }
    await openPaystackCheckout({
      accessCode: result.accessCode,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
      onCancel: () => setPending(false),
    });
  }

  return (
    <div>
      <Button
        type="button"
        size="lg"
        disabled={pending}
        onClick={() => void pay()}
        className="h-11 rounded-none bg-store-moss px-8 text-store-sand hover:bg-store-ink"
      >
        {pending ? "Opening Paystack…" : "Pay with Paystack"}
      </Button>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
