"use client";

import { CircleCheck, Truck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckoutStep = "shipping" | "payment" | "confirmation";

const steps: { id: CheckoutStep; label: string; icon: typeof Truck }[] = [
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: Wallet },
  { id: "confirmation", label: "Confirmation", icon: CircleCheck },
];

export function CheckoutSteps({
  current,
  onSelect,
}: {
  current: CheckoutStep;
  onSelect?: (step: CheckoutStep) => void;
}) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <ol aria-label="Checkout progress" className="flex items-start justify-center">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const reached = index <= currentIndex;
        const active = index === currentIndex;
        const canSelect = Boolean(onSelect) && index < currentIndex;
        const body = (
          <>
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                reached ? "bg-store-moss text-store-sand" : "bg-store-mist text-store-ink/45",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <span
              className={cn(
                "text-xs sm:text-sm",
                active ? "font-medium text-store-ink" : reached ? "text-store-ink" : "text-store-ink/45",
              )}
            >
              {step.label}
            </span>
          </>
        );

        return (
          <li key={step.id} className="flex items-center">
            {index > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "mx-2 mt-4 h-0.5 w-6 self-start sm:mx-3 sm:w-14",
                  index <= currentIndex ? "bg-store-moss" : "bg-store-mist",
                )}
              />
            ) : null}
            {canSelect ? (
              <button
                type="button"
                onClick={() => onSelect?.(step.id)}
                aria-current={active ? "step" : undefined}
                className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2"
              >
                {body}
              </button>
            ) : (
              <span
                aria-current={active ? "step" : undefined}
                className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2"
              >
                {body}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
