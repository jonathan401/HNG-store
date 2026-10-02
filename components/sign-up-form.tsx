"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { signUpWithEmail } from "@/utils/actions/auth.action";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { authFieldClass, authSubmitClass } from "@/components/store/auth-page";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const loginHref =
    next && next.startsWith("/") && !next.startsWith("//")
      ? `/auth/login?next=${encodeURIComponent(next)}`
      : "/auth/login";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUpWithEmail({ email, password });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(className)} {...props}>
      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
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
          <Label htmlFor="password" className="mb-2 block text-store-ink/80">
            Password
          </Label>
          <PasswordInput
            id="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
          />
        </div>
        <div>
          <Label htmlFor="repeat-password" className="mb-2 block text-store-ink/80">
            Repeat password
          </Label>
          <PasswordInput
            id="repeat-password"
            required
            autoComplete="new-password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className={authFieldClass}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={authSubmitClass} disabled={isLoading}>
          {isLoading ? "Creating an account…" : "Create account"}
        </button>
        <p className="text-center text-sm text-store-ink/70">
          Already have an account?{" "}
          <Link href={loginHref} className="text-store-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
