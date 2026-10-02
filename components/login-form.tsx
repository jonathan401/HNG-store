"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { authFieldClass, authSubmitClass } from "@/components/store/auth-page";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import GoogleIcon from "./ui/icons/GoogleIcon";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const signUpHref =
    destination === "/" ? "/auth/sign-up" : `/auth/sign-up?next=${encodeURIComponent(destination)}`;

  const handleLoginWithGoogle = async () => {
    const supabase = createClient();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
        },
      });
      if (error) throw error;
      router.push(data.url);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push(destination);
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div>
          <Label htmlFor="email" className="mb-2 block text-store-ink/80">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@email.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldClass}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center">
            <Label htmlFor="password" className="text-store-ink/80">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="ml-auto text-sm text-store-ink/60 underline-offset-4 hover:text-store-ink hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={authSubmitClass} disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-store-ink/40">
        <span className="h-px flex-1 bg-store-mist" />
        or
        <span className="h-px flex-1 bg-store-mist" />
      </div>
      <button
        type="button"
        className="flex h-11 w-full items-center justify-center gap-2 border border-store-mist bg-store-sand text-sm hover:border-store-ink disabled:opacity-50"
        disabled={isLoading}
        onClick={handleLoginWithGoogle}
      >
        <GoogleIcon className="size-4" />
        Continue with Google
      </button>
      <p className="text-center text-sm text-store-ink/70">
        Don&apos;t have an account?{" "}
        <Link href={signUpHref} className="text-store-ink underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}
