"use client";

import { cn } from "@/lib/utils";
import { requestPasswordReset } from "@/utils/actions/auth.action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authFieldClass, authSubmitClass } from "@/components/store/auth-page";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset(email);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <p className="text-sm leading-relaxed text-store-ink/80">
        If this email has an account, a reset link is on its way. Open it to choose a new password.
      </p>
    );
  }

  return (
    <div className={cn(className)} {...props}>
      <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
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
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={authSubmitClass} disabled={isLoading}>
          {isLoading ? "Sending…" : "Send reset email"}
        </button>
        <p className="text-center text-sm text-store-ink/70">
          Remembered it?{" "}
          <Link href="/auth/login" className="text-store-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
