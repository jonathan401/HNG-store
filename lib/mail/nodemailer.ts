import nodemailer from "nodemailer";

type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type MailResult = { ok: true } | { ok: false; error: string; retry?: boolean };

const RETRYABLE = new Set(["ECONNECTION", "ETIMEDOUT", "ESOCKET", "EDNS"]);

function mailClient() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  if (!host || !user || !pass || !from) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  return {
    from,
    transport: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
  };
}

function errorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return "";
  return typeof error.code === "string" ? error.code : "";
}

async function postMail(message: MailMessage): Promise<MailResult> {
  const client = mailClient();
  if (!client) return { ok: false, error: "Email is not configured." };

  try {
    await client.transport.sendMail({
      from: client.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return { ok: true };
  } catch (error) {
    const code = errorCode(error);
    console.error("SMTP send failed", code || "unknown");
    if (code === "EAUTH" || code === "ENOAUTH") {
      return { ok: false, error: "The mail server rejected the login." };
    }
    return { ok: false, error: "Could not send the email.", retry: RETRYABLE.has(code) };
  }
}

export async function sendMail(
  message: MailMessage,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const first = await postMail(message);
  if (first.ok || !first.retry) return first;
  return postMail(message);
}
