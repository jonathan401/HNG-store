"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function MenuSelect({
  name,
  value,
  defaultValue,
  onValueChange,
  options,
  ariaLabel,
  className,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value ?? "");
  const selected = value ?? internal;
  const label = options.find((option) => option.value === selected)?.label ?? "Choose";

  function change(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <>
      {name ? <input type="hidden" name={name} value={selected} /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            className={cn(
              "flex h-11 w-full items-center justify-between gap-3 border border-store-mist bg-store-paper px-3 text-left text-sm text-store-ink outline-none ring-store-moss focus-visible:ring-1 data-[state=open]:ring-1",
              className,
            )}
          >
            <span className="truncate">{label}</span>
            <ChevronDown className="size-4 shrink-0 text-store-ink/60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)] border-store-mist bg-store-paper text-store-ink"
        >
          <DropdownMenuRadioGroup value={selected} onValueChange={change}>
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="focus:bg-store-mist focus:text-store-ink"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
