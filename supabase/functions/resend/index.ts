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

const STORE_ORIGIN = "https://hng-store-fr67.vercel.app";
const serif = "Georgia, 'Times New Roman', serif";
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function authEmailHtml(input: { title: string; eyebrow: string; intro: string; href: string; action: string; ignore: string }) {
  const href = escapeHtml(input.href);
  const home = escapeHtml(`${STORE_ORIGIN}/`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4efe6;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.intro)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="background:#1e3d32;padding:20px 28px;">
              <a href="${home}" style="font-family:${serif};font-size:22px;line-height:1;color:#f4efe6;text-decoration:none;">HNG Store</a>
            </td>
          </tr>
          <tr>
            <td style="background:#fbf8f3;border:1px solid #e4ddd0;border-top:0;padding:32px 28px;">
              <p style="margin:0;font-family:${sans};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#c15a2e;">${escapeHtml(input.eyebrow)}</p>
              <h1 style="margin:10px 0 0;font-family:${serif};font-size:32px;line-height:1.15;font-weight:normal;color:#1c1917;">${escapeHtml(input.title)}</h1>
              <p style="margin:20px 0 0;font-family:${sans};font-size:15px;line-height:1.6;color:#1c1917;">${escapeHtml(input.intro)}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
                <tr>
                  <td style="background:#1e3d32;">
                    <a href="${href}" style="display:inline-block;padding:14px 22px;font-family:${sans};font-size:14px;line-height:1;color:#f4efe6;text-decoration:none;">${escapeHtml(input.action)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;font-family:${sans};font-size:13px;line-height:1.5;color:#6b6560;">Or copy this link into your browser:<br /><a href="${href}" style="color:#1e3d32;word-break:break-all;">${href}</a></p>
              <p style="margin:18px 0 0;font-family:${sans};font-size:13px;line-height:1.5;color:#6b6560;">${escapeHtml(input.ignore)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 8px 0;font-family:${sans};font-size:12px;line-height:1.5;color:#6b6560;text-align:center;">
              <a href="${home}" style="color:#6b6560;text-decoration:none;">Visit the shop</a><br />
              A small shop of goods for daily use, priced in naira.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function messageFor(emailData: EmailData) {
  const nextByType: Record<string, string> = {
    signup: "/",
    recovery: "/auth/update-password",
    magiclink: "/",
    invite: "/",
    email_change: "/",
  };
  const next = nextByType[emailData.email_action_type] ?? nextPath(emailData.redirect_to, emailData.site_url);
  const url = new URL("/auth/confirm", STORE_ORIGIN);
  url.searchParams.set("token_hash", emailData.token_hash);
  url.searchParams.set("type", emailData.email_action_type);
  url.searchParams.set("next", next);

  const copy: Record<string, { subject: string; eyebrow: string; title: string; intro: string; action: string; ignore: string }> = {
    signup: {
      subject: "Confirm your HNG Store account",
      eyebrow: "Account",
      title: "Confirm your account",
      intro: "Confirm this address to finish creating your HNG Store account.",
      action: "Confirm account",
      ignore: "If you did not create an account, you can ignore this email.",
    },
    recovery: {
      subject: "Reset your HNG Store password",
      eyebrow: "Password",
      title: "Reset your password",
      intro: "Choose a new password for your HNG Store account. The link below opens the password page on the shop.",
      action: "Reset password",
      ignore: "If you did not ask to reset a password, you can ignore this email. The current password stays as it is.",
    },
    magiclink: {
      subject: "Your HNG Store sign-in link",
      eyebrow: "Sign in",
      title: "Your sign-in link",
      intro: "Open the link below to sign in to HNG Store.",
      action: "Sign in",
      ignore: "If you did not ask to sign in, you can ignore this email.",
    },
    invite: {
      subject: "You are invited to HNG Store",
      eyebrow: "Invite",
      title: "You are invited",
      intro: "Open the link below to accept your HNG Store invite.",
      action: "Accept invite",
      ignore: "If you were not expecting an invite, you can ignore this email.",
    },
    email_change: {
      subject: "Confirm your new HNG Store email",
      eyebrow: "Email",
      title: "Confirm your new email",
      intro: "Open the link below to confirm this email address for HNG Store.",
      action: "Confirm email",
      ignore: "If you did not ask to change an email, you can ignore this email.",
    },
  };
  const selected = copy[emailData.email_action_type] ?? {
    subject: "HNG Store",
    eyebrow: "HNG Store",
    title: "Continue to the shop",
    intro: "Open the link below to continue to HNG Store.",
    action: "Continue",
    ignore: "If you were not expecting this email, you can ignore it.",
  };
  const href = url.toString();
  return {
    subject: selected.subject,
    text: [selected.intro, "", href, "", selected.ignore].join("\n"),
    html: authEmailHtml({ ...selected, href }),
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
