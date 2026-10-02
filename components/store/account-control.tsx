"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function AccountControl({
  email,
  isAdmin,
}: {
  email: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();

  if (!email) {
    return (
      <Link
        href="/auth/login"
        className="px-2 text-sm underline-offset-4 hover:underline"
      >
        Sign in
      </Link>
    );
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="grid h-10 w-10 place-items-center rounded-full hover:bg-store-mist"
        aria-label="Account"
      >
        <User className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account/orders">Orders</Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
