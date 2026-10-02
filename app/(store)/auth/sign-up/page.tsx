import { Suspense } from "react";
import { AuthPage } from "@/components/store/auth-page";
import { SignUpForm } from "@/components/sign-up-form";

export const metadata = {
  title: "Create an account · HNG Store",
};

export default function Page() {
  return (
    <AuthPage
      title="Create an account"
      copy="An account keeps your bag and the orders you place. A confirmation is sent to your email."
    >
      <Suspense>
        <SignUpForm />
      </Suspense>
    </AuthPage>
  );
}
