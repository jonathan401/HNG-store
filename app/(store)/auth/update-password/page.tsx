import { AuthPage } from "@/components/store/auth-page";
import { UpdatePasswordForm } from "@/components/update-password-form";

export const metadata = {
  title: "New password · HNG Store",
};

export default function Page() {
  return (
    <AuthPage
      title="Choose a new password"
      copy="This replaces the password on the account. You can sign in with it afterwards."
    >
      <UpdatePasswordForm />
    </AuthPage>
  );
}
