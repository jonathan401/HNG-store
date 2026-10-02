"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MenuSelect } from "@/components/ui/menu-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderSummary } from "@/components/store/order-summary";
import { useCart, useCartLines } from "@/lib/store/cart";
import {
  DEFAULT_CAPITAL,
  NIGERIAN_CAPITALS,
  capitalChoice,
} from "@/lib/store/nigeria";
import { formatPrice } from "@/lib/store/products";
import { placeOrder } from "@/utils/actions/order.action";
import type { PaymentProvider } from "@/lib/dal/types";

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  payment: "delivery" | PaymentProvider;
};

const fieldClass =
  "h-11 rounded-none border-store-mist bg-store-paper text-store-ink shadow-none";

export function CheckoutView({
  signedIn,
  defaultEmail,
}: {
  signedIn: boolean;
  defaultEmail: string;
}) {
  const lines = useCartLines();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { clear, ready } = useCart();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: defaultEmail,
    phone: "",
    address: "",
    city: DEFAULT_CAPITAL,
    note: "",
    payment: "delivery",
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [order, setOrder] = useState<{
    id: string;
    email: string;
    total: number;
    provider: PaymentProvider | null;
  } | null>(null);

  useEffect(() => {
    if (scrollRef.current && signedIn && !order) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollRef, signedIn, order]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!signedIn) {
      setError("Sign in to place an order.");
      return;
    }
    setPending(true);
    setError("");
    const result = await placeOrder({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      note: form.note,
      provider: form.payment === "delivery" ? null : form.payment,
      items: lines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
      })),
    });
    setPending(false);
    if ("error" in result) {
      setError(result.error ?? "Could not place the order.");
      return;
    }
    setOrder({
      id: result.id,
      email: result.email,
      total: result.total,
      provider: result.provider,
    });
    clear();
  }

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6" />;
  }

  if (order) {
    return (
      <div
        ref={scrollRef}
        className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6"
      >
        <p className="text-xs uppercase tracking-[0.18em] text-store-clay">
          Order saved
        </p>
        <h1 className="mt-3 break-all font-display text-4xl">{order.id}</h1>
        <p className="mt-4 text-store-ink/70">
          Saved for {order.email}.
          {order.provider
            ? ` A ${order.provider} payment was started and is waiting to be confirmed.`
            : " Pay when the order arrives."}
        </p>
        <p className="mt-2 text-sm">Total {formatPrice(order.total)}</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href={`/account/orders/${order.id}`}
            className="text-sm underline"
          >
            View the order
          </Link>
          <Link href="/shop" className="text-sm underline">
            Back to the shop
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-5xl">Nothing to check out.</h1>
        <Link href="/shop" className="mt-6 inline-block text-sm underline">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-store-clay">
            Checkout
          </p>
          <h1 className="mt-2 font-display text-5xl">Where should it go?</h1>
        </div>

        {!signedIn ? (
          <p className="border border-store-mist bg-store-paper p-4 text-sm">
            Sign in so this order can be saved to your account.{" "}
            <Link href="/auth/login?next=/checkout" className="underline">
              Sign in
            </Link>
          </p>
        ) : null}

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-display text-2xl">Contact</legend>
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
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
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

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-display text-2xl">Delivery</legend>
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

        <fieldset>
          <legend className="mb-3 font-display text-2xl">Payment</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                [
                  "delivery",
                  "Pay on delivery",
                  "Cash or transfer when the bag arrives.",
                ],
                [
                  "paystack",
                  "Paystack",
                  "A payment is recorded and confirmed by the shop.",
                ],
                [
                  "flutterwave",
                  "Flutterwave",
                  "A payment is recorded and confirmed by the shop.",
                ],
                [
                  "stripe",
                  "Stripe",
                  "A payment is recorded and confirmed by the shop.",
                ],
              ] as const
            ).map(([id, label, copy]) => (
              <label
                key={id}
                className={`cursor-pointer border p-4 ${
                  form.payment === id
                    ? "border-store-ink bg-store-paper"
                    : "border-store-mist"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="sr-only"
                  checked={form.payment === id}
                  onChange={() => update("payment", id)}
                />
                <span className="block text-sm font-medium">{label}</span>
                <span className="mt-1 block text-sm text-store-ink/70">
                  {copy}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-11 rounded-none bg-store-moss px-8 text-store-sand hover:bg-store-ink"
        >
          {pending
            ? "Saving order…"
            : signedIn
              ? "Place order"
              : "Sign in to place order"}
        </Button>
      </form>
      <div>
        <OrderSummary />
        <ul className="mt-4 space-y-2 text-sm text-store-ink/70">
          {lines.map((line) => (
            <li key={line.product.id} className="flex justify-between gap-3">
              <span>
                {line.product.name} × {line.quantity}
              </span>
              <span>{formatPrice(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
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
