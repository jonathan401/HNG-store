import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { categoriesFrom } from "@/lib/store/products";
import { getViewer } from "@/lib/dal/session";
import { getProducts } from "@/utils/actions/product.action";
import { AccountControl } from "@/components/store/account-control";
import { CartLink } from "@/components/store/cart-link";
import { MobileNav } from "@/components/store/mobile-nav";
import { NavLinks } from "@/components/store/nav-links";

function SearchField({ className }: { className?: string }) {
  return (
    <form action="/shop" className={className}>
      <label className="relative block">
        <span className="sr-only">Search the shop</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-store-ink/50" />
        <input
          name="q"
          placeholder="Search the shop"
          className="h-10 w-full rounded-full border border-store-mist bg-store-paper pl-9 pr-4 text-sm outline-none ring-store-moss placeholder:text-store-ink/40 focus:ring-1"
        />
      </label>
    </form>
  );
}

function HeaderBar({
  children,
  categories = [],
  email = null,
  isAdmin = false,
}: {
  children?: React.ReactNode;
  categories?: string[];
  email?: string | null;
  isAdmin?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-store-mist bg-store-sand/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <MobileNav categories={categories} email={email} isAdmin={isAdmin} />
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center bg-store-moss font-display text-lg text-store-sand">
            H
          </span>
          <span className="font-display text-lg leading-none tracking-tight">HNG Store</span>
        </Link>
        <nav className="ml-6 hidden items-center gap-6 lg:flex">{children}</nav>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <SearchField className="hidden w-44 md:block lg:w-56" />
          <CartLink />
          <ThemeSwitcher />
          <AccountControl email={email} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}

async function SiteHeaderContent() {
  let categories: string[] = [];
  try {
    categories = categoriesFrom(await getProducts());
  } catch {
    categories = [];
  }
  const viewer = await getViewer();

  return (
    <HeaderBar categories={categories} email={viewer?.email ?? null} isAdmin={viewer?.role === "admin"}>
      <NavLinks categories={categories} />
    </HeaderBar>
  );
}

export function SiteHeader() {
  return (
    <Suspense
      fallback={
        <HeaderBar>
          <Link href="/" className="text-sm">
            Home
          </Link>
          <Link href="/shop" className="text-sm">
            Our collections
          </Link>
          <Link href="/about" className="text-sm">
            About us
          </Link>
          <Link href="/contact" className="text-sm">
            Contact us
          </Link>
        </HeaderBar>
      }
    >
      <SiteHeaderContent />
    </Suspense>
  );
}
