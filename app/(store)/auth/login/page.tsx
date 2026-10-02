import { Suspense } from "react";
import { AuthPage } from "@/components/store/auth-page";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Sign in · HNG Store",
};

export default function Page() {
  return (
    <AuthPage
      title="Sign in"
      copy="Sign in to keep a bag with this account, and to find the orders you place."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthPage>
  );
}
