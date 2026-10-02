"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail/nodemailer";
import { confirmLink, recoveryMessage, signupMessage, STORE_ORIGIN } from "@/lib/mail/messages";

export async function signUpWithEmail(input: {
  email: string;
  password: string;
}): Promise<{ error: string } | { ok: true }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  if (!email.includes("@")) return { error: "That email does not look complete." };
  if (password.length < 6) return { error: "Use at least 6 characters for the password." };

  const admin = createAdminClient();
  if (!admin) return { error: "Email sign-up is not available right now." };

  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
  });

  if (error || !data?.properties?.hashed_token) {
    const message = error?.message ?? "Could not create the account.";
    if (/already/i.test(message)) {
      return { error: "An account with this email already exists. Sign in instead." };
    }
    return { error: message };
  }

  const sent = await sendMail({
    to: email,
    ...signupMessage(confirmLink(STORE_ORIGIN, data.properties.hashed_token, "signup", "/")),
  });
  if (!sent.ok) {
    if (data.user?.id) await admin.auth.admin.deleteUser(data.user.id);
    return { error: sent.error };
  }

  return { ok: true };
}

export async function requestPasswordReset(email: string): Promise<{ error: string } | { ok: true }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return { error: "That email does not look complete." };

  const admin = createAdminClient();
  if (!admin) return { error: "Password reset email is not available right now." };

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: normalized,
  });

  if (error || !data?.properties?.hashed_token) {
    const missingUser = error?.status === 404 || /not found/i.test(error?.message ?? "");
    if (missingUser) return { ok: true };
    return { error: "Could not send the reset email." };
  }

  const sent = await sendMail({
    to: normalized,
    ...recoveryMessage(
      confirmLink(STORE_ORIGIN, data.properties.hashed_token, "recovery", "/auth/update-password"),
    ),
  });
  if (!sent.ok) return { error: sent.error };
  return { ok: true };
}
