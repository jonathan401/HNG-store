"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", match: (pathname: string) => pathname === "/admin" },
  {
    href: "/admin/products",
    label: "Products",
    match: (pathname: string) => pathname.startsWith("/admin/products"),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    match: (pathname: string) => pathname.startsWith("/admin/orders"),
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Desk" className="flex flex-wrap gap-2">
      {links.map((link) => {
        const current = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "border px-3 py-1.5 text-sm",
              current
                ? "border-store-ink bg-store-ink text-store-sand"
                : "border-store-mist bg-store-paper text-store-ink/70 hover:border-store-ink hover:text-store-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
