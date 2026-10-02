import { AuthPage } from "@/components/store/auth-page";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata = {
  title: "Reset password · HNG Store",
};

export default function Page() {
  return (
    <AuthPage
      title="Reset your password"
      copy="Enter the email on the account. A link to choose a new password will be sent there."
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}
