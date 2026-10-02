"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuSelect } from "@/components/ui/menu-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckoutSteps, type CheckoutStep } from "@/components/store/checkout-steps";
import { OrderSummary } from "@/components/store/order-summary";
import { CheckoutSkeleton } from "@/components/store/skeletons";
import { useCart, useCartLines } from "@/lib/store/cart";
import {
  DEFAULT_CAPITAL,
  NIGERIAN_CAPITALS,
  capitalChoice,
} from "@/lib/store/nigeria";
import { deliveryFee, formatPrice } from "@/lib/store/products";
import { createClient } from "@/lib/supabase/client";
import { openPaystackCheckout, preloadPaystack } from "@/lib/store/paystack-popup";
import { abandonUnpaidOrder, placeOrder } from "@/utils/actions/order.action";

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string;
};

const fieldClass =
  "h-11 rounded-none border-store-mist bg-store-sand text-store-ink shadow-none";

export function CheckoutView({
  signedIn,
  defaultEmail,
  paymentError = "",
}: {
  signedIn: boolean;
  defaultEmail: string;
  paymentError?: string;
}) {
  const lines = useCartLines();
  const { clear, ready, syncing } = useCart();
  const [accountEmail, setAccountEmail] = useState(defaultEmail);
  const [emailEdited, setEmailEdited] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: defaultEmail,
    phone: "",
    address: "",
    city: DEFAULT_CAPITAL,
    note: "",
  });
  const email = emailEdited ? form.email : accountEmail || form.email;
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const keptLines = useRef(lines);
  if (lines.length > 0) keptLines.current = lines;
  const shownLines =
    lines.length > 0 ? lines : pending || !ready || syncing ? keptLines.current : lines;
  const subtotal = shownLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const total = subtotal + deliveryFee(subtotal);

  useEffect(() => {
    preloadPaystack();
  }, []);

  useEffect(() => {
    if (defaultEmail) {
      setAccountEmail(defaultEmail);
      return;
    }
    let cancelled = false;
    void createClient()
      .auth.getUser()
      .then(({ data }) => {
        const metadataEmail = data.user?.user_metadata?.email;
        const next =
          data.user?.email?.trim() ||
          (typeof metadataEmail === "string" ? metadataEmail.trim() : "");
        if (!cancelled && next) setAccountEmail(next);
      });
    return () => {
      cancelled = true;
    };
  }, [defaultEmail]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function continueToPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    setError("");
    setStep("payment");
    window.scrollTo({ top: 0 });
  }

  async function pay() {
    if (!signedIn) {
      setError("Sign in to place an order.");
      return;
    }
    setPending(true);
    setError("");
    const result = await placeOrder({
      name: form.name,
      email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      note: form.note,
      items: shownLines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
      })),
    });
    if ("error" in result) {
      setPending(false);
      setError(result.error ?? "Could not place the order.");
      return;
    }
    await openPaystackCheckout({
      accessCode: result.accessCode,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
      onPaid: () => {
        clear();
      },
      onCancel: () => {
        setPending(false);
        setError("Payment was cancelled. These items are still in your bag.");
        void abandonUnpaidOrder(result.id).then((released) => {
          if ("error" in released) {
            setError(released.error ?? "Could not cancel the payment.");
            return;
          }
          if (released.paid) {
            clear();
            window.location.assign(`/account/orders/${result.id}?payment=paid`);
          }
        });
      },
    });
  }

  if (shownLines.length === 0 && (!ready || syncing)) {
    return <CheckoutSkeleton />;
  }

  if (shownLines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-5xl">Nothing to check out.</h1>
        {paymentError ? <p className="mt-4 text-sm text-destructive">{paymentError}</p> : null}
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/account/orders" className="text-sm underline">
            Your orders
          </Link>
          <Link href="/shop" className="text-sm underline">
            Browse the shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <CheckoutSteps
        current={step}
        onSelect={(next) => {
          if (next === "shipping") {
            setStep("shipping");
            window.scrollTo({ top: 0 });
          }
        }}
      />
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {step === "shipping" ? (
          <form
            onSubmit={continueToPayment}
            className="border border-store-mist bg-store-paper p-5 sm:p-6"
          >
            <h1 className="font-display text-3xl">Shipping</h1>
            {!signedIn ? (
              <p className="mt-4 border border-store-mist bg-store-sand p-4 text-sm">
                Sign in so this order can be saved to your account.{" "}
                <Link href="/auth/login?next=/checkout" className="underline">
                  Sign in
                </Link>
              </p>
            ) : null}
            {paymentError ? (
              <p className="mt-4 text-sm text-destructive">{paymentError}</p>
            ) : null}
            <fieldset className="mt-6 grid gap-4 sm:grid-cols-2">
              <legend className="mb-2 text-sm font-medium">Contact</legend>
              <Field label="Full name" required className="sm:col-span-2">
                <Input
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  className={fieldClass}
                  autoComplete="name"
                  required
                />
              </Field>
              <Field label="Email" required>
                <Input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => {
                    setEmailEdited(true);
                    update("email", event.target.value);
                  }}
                  className={fieldClass}
                  autoComplete="email"
                  required
                />
              </Field>
              <Field label="Phone" required>
                <Input
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  className={fieldClass}
                  autoComplete="tel"
                  required
                />
              </Field>
            </fieldset>
            <fieldset className="mt-6 grid gap-4">
              <legend className="mb-2 text-sm font-medium">Delivery</legend>
              <Field label="Address" required>
                <Input
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                  className={fieldClass}
                  autoComplete="street-address"
                  required
                />
              </Field>
              <Field label="City" required>
                <MenuSelect
                  ariaLabel="City"
                  value={form.city}
                  onValueChange={(city) => update("city", city)}
                  options={NIGERIAN_CAPITALS.map((place) => {
                    const value = capitalChoice(place);
                    return { value, label: value };
                  })}
                />
              </Field>
              <Field label="Note for the courier">
                <Input
                  value={form.note}
                  onChange={(event) => update("note", event.target.value)}
                  className={fieldClass}
                  placeholder="Gate code, landmark, a quieter hour"
                />
              </Field>
            </fieldset>
            <Button
              type="submit"
              size="lg"
              className="mt-6 h-12 w-full rounded-none bg-store-moss text-store-sand hover:bg-store-ink"
            >
              Continue to payment
            </Button>
          </form>
        ) : (
          <section className="border border-store-mist bg-store-paper p-5 sm:p-6">
            <h1 className="font-display text-3xl">Payment</h1>
            <div className="mt-6 bg-store-sand p-4">
              <p className="text-sm font-medium">Shipping to</p>
              <p className="mt-3 text-sm leading-relaxed text-store-ink/75">
                {form.name}
                <br />
                {form.address}
                <br />
                {form.city}
                <br />
                {form.phone}
                <br />
                {email}
              </p>
              {form.note ? (
                <p className="mt-2 text-sm text-store-ink/60">{form.note}</p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setStep("shipping");
                  window.scrollTo({ top: 0 });
                }}
                className="mt-3 text-sm text-store-moss"
              >
                Edit address
              </button>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-store-ink/70">
              Click the button below to pay securely with Paystack. You can pay with your card,
              bank transfer, or USSD.
            </p>
            {error || paymentError ? (
              <p className="mt-4 text-sm text-destructive">{error || paymentError}</p>
            ) : null}
            {signedIn ? (
              <Button
                type="button"
                size="lg"
                disabled={pending}
                onClick={() => void pay()}
                className="mt-6 h-12 w-full rounded-none bg-store-moss text-store-sand hover:bg-store-ink"
              >
                <Wallet aria-hidden />
                {pending ? "Opening Paystack…" : `Pay ${formatPrice(total)}`}
              </Button>
            ) : (
              <Link
                href="/auth/login?next=/checkout"
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 bg-store-moss text-sm text-store-sand hover:bg-store-ink"
              >
                <Wallet className="size-4" aria-hidden />
                Sign in to pay
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setStep("shipping");
                window.scrollTo({ top: 0 });
              }}
              className="mt-4 w-full text-center text-sm text-store-ink/70"
            >
              Back to shipping
            </button>
          </section>
        )}
        <OrderSummary lines={shownLines} />
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-store-ink/80">
        {label}
        {required ? (
          <span className="text-store-clay" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      {children}
    </div>
  );
}
