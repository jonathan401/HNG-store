"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { authFieldClass, authSubmitClass } from "@/components/store/auth-page";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(className)} {...props}>
      <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
        <div>
          <Label htmlFor="password" className="mb-2 block text-store-ink/80">
            New password
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
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={authSubmitClass} disabled={isLoading}>
          {isLoading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
