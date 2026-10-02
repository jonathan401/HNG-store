import nodemailer from "nodemailer";
import { Webhook } from "standardwebhooks";

type EmailData = {
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function nextPath(redirectTo: string, siteUrl: string) {
  if (!redirectTo) return "/";
  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) return redirectTo;
  try {
    const target = new URL(redirectTo);
    const site = new URL(siteUrl);
    if (target.origin === site.origin) return `${target.pathname}${target.search}` || "/";
  } catch {
    return "/";
  }
  return "/";
}

function messageFor(emailData: EmailData) {
  const next = nextPath(emailData.redirect_to, emailData.site_url);
  const url = new URL("/auth/confirm", emailData.site_url);
  url.searchParams.set("token_hash", emailData.token_hash);
  url.searchParams.set("type", emailData.email_action_type);
  url.searchParams.set("next", next);

  const copy: Record<string, { subject: string; intro: string; ignore: string }> = {
    signup: {
      subject: "Confirm your HNG Store account",
      intro: "Confirm your HNG Store account by opening this link:",
      ignore: "If you did not create an account, you can ignore this email.",
    },
    recovery: {
      subject: "Reset your HNG Store password",
      intro: "Choose a new HNG Store password by opening this link:",
      ignore: "If you did not ask to reset a password, you can ignore this email.",
    },
    magiclink: {
      subject: "Your HNG Store sign-in link",
      intro: "Sign in to HNG Store by opening this link:",
      ignore: "If you did not ask to sign in, you can ignore this email.",
    },
    invite: {
      subject: "You are invited to HNG Store",
      intro: "Accept your HNG Store invite by opening this link:",
      ignore: "If you were not expecting an invite, you can ignore this email.",
    },
    email_change: {
      subject: "Confirm your new HNG Store email",
      intro: "Confirm this email address for HNG Store by opening this link:",
      ignore: "If you did not ask to change an email, you can ignore this email.",
    },
  };
  const selected = copy[emailData.email_action_type] ?? {
    subject: "HNG Store",
    intro: "Continue to HNG Store by opening this link:",
    ignore: "If you were not expecting this email, you can ignore it.",
  };
  const href = url.toString();
  return {
    subject: selected.subject,
    text: [selected.intro, "", href, "", selected.ignore].join("\n"),
    html: `<p>${escapeHtml(selected.intro)}</p><p><a href="${escapeHtml(href)}">${escapeHtml(selected.subject)}</a></p><p>${escapeHtml(selected.ignore)}</p>`,
  };
}

async function sendWithSmtp(to: string, subject: string, text: string, html: string) {
  const host = Deno.env.get("SMTP_HOST");
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");
  const from = Deno.env.get("SMTP_FROM");
  if (!host || !user || !pass || !from) throw new Error("Missing SMTP credentials");

  const port = Number(Deno.env.get("SMTP_PORT") ?? "587");
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transport.sendMail({ from, to, subject, text, html });
  } catch {
    throw new Error("SMTP send failed");
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const secret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
  if (!secret) {
    return new Response(JSON.stringify({ error: "Missing send email hook secret" }), { status: 500 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  try {
    const wh = new Webhook(secret.replace("v1,whsec_", ""));
    const { user, email_data } = wh.verify(payload, headers) as {
      user: { email: string };
      email_data: EmailData;
    };
    const message = messageFor(email_data);
    await sendWithSmtp(user.email, message.subject, message.text, message.html);
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send auth email";
    const status = message.startsWith("SMTP") || message.startsWith("Missing") ? 500 : 401;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
});
