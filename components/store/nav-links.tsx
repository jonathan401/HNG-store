"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function NavLinks({ categories }: { categories: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const activeCategory = params.get("category");
  const collectionsActive = pathname === "/shop";

  const linkClass = (active: boolean) =>
    cn(
      "text-sm tracking-wide underline-offset-4",
      active ? "underline decoration-store-clay" : "hover:underline",
    );

  return (
    <>
      <Link href="/" className={linkClass(pathname === "/")}>
        Home
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "group inline-flex items-center gap-1 text-sm tracking-wide underline-offset-4 outline-none",
            collectionsActive ? "underline decoration-store-clay" : "hover:underline",
          )}
        >
          Our collections
          <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-44 border-store-mist bg-store-paper text-store-ink"
        >
          <DropdownMenuItem
            className="focus:bg-store-mist focus:text-store-ink"
            onSelect={() => router.push("/shop")}
          >
            All goods
          </DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem
              key={category}
              className={cn(
                "focus:bg-store-mist focus:text-store-ink",
                pathname === "/shop" && activeCategory === category && "font-medium",
              )}
              onSelect={() => router.push(`/shop?category=${encodeURIComponent(category)}`)}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Link href="/about" className={linkClass(pathname === "/about")}>
        About us
      </Link>
      <Link href="/contact" className={linkClass(pathname === "/contact")}>
        Contact us
      </Link>
    </>
  );
}
