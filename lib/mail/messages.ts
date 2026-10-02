import { formatPrice } from "@/lib/store/products";

export const STORE_ORIGIN = "https://hng-store-fr67.vercel.app";

const serif = "Georgia, 'Times New Roman', serif";
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export function storeUrl(path = "/") {
  if (!path || path === "/") return `${STORE_ORIGIN}/`;
  return `${STORE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function confirmLink(origin: string, tokenHash: string, type: string, next: string) {
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
    next,
  });
  return `${origin}/auth/confirm?${params.toString()}`;
}

function emailShell(input: { preheader: string; eyebrow: string; title: string; body: string }) {
  const preheader = escapeHtml(input.preheader);
  const home = escapeHtml(storeUrl("/"));
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4efe6;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
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
              <div style="margin-top:20px;font-family:${sans};font-size:15px;line-height:1.6;color:#1c1917;">
                ${input.body}
              </div>
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

function actionButton(href: string, label: string) {
  const safeHref = escapeHtml(href);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
    <tr>
      <td style="background:#1e3d32;">
        <a href="${safeHref}" style="display:inline-block;padding:14px 22px;font-family:${sans};font-size:14px;line-height:1;color:#f4efe6;text-decoration:none;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function linkMessage(input: {
  subject: string;
  eyebrow: string;
  title: string;
  intro: string;
  url: string;
  action: string;
  ignore: string;
}) {
  const safeUrl = escapeHtml(input.url);
  return {
    subject: input.subject,
    text: [input.intro, "", input.url, "", input.ignore].join("\n"),
    html: emailShell({
      preheader: input.intro,
      eyebrow: input.eyebrow,
      title: input.title,
      body: `<p style="margin:0;">${escapeHtml(input.intro)}</p>
        ${actionButton(input.url, input.action)}
        <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#6b6560;">Or copy this link into your browser:<br /><a href="${safeUrl}" style="color:#1e3d32;word-break:break-all;">${safeUrl}</a></p>
        <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#6b6560;">${escapeHtml(input.ignore)}</p>`,
    }),
  };
}

export function signupMessage(url: string) {
  return linkMessage({
    subject: "Confirm your HNG Store account",
    eyebrow: "Account",
    title: "Confirm your account",
    intro: "Confirm this address to finish creating your HNG Store account.",
    url,
    action: "Confirm account",
    ignore: "If you did not create an account, you can ignore this email.",
  });
}

export function recoveryMessage(url: string) {
  const safeUrl = escapeHtml(url);
  const passwordPage = storeUrl("/auth/update-password");
  const intro = "Choose a new password for your HNG Store account.";
  return {
    subject: "Reset your HNG Store password",
    text: [
      intro,
      "",
      url,
      "",
      `That link opens the password page: ${passwordPage}`,
      "",
      "If you did not ask to reset a password, you can ignore this email.",
    ].join("\n"),
    html: emailShell({
      preheader: intro,
      eyebrow: "Password",
      title: "Reset your password",
      body: `<p style="margin:0;">${escapeHtml(intro)} The link below opens the password page on the shop.</p>
        ${actionButton(url, "Reset password")}
        <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#6b6560;">Or copy this link into your browser:<br /><a href="${safeUrl}" style="color:#1e3d32;word-break:break-all;">${safeUrl}</a></p>
        <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#6b6560;">If you did not ask to reset a password, you can ignore this email. The current password stays as it is.</p>`,
    }),
  };
}

export function orderMessage(input: {
  name: string;
  orderId: string;
  total: number;
  address: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  orderUrl: string | null;
}) {
  const code = input.orderId.slice(0, 8).toUpperCase();
  const itemLines = input.items.map(
    (item) => `${item.name} × ${item.quantity} — ${formatPrice(item.unitPrice * item.quantity)}`,
  );
  const text = [
    `Hi ${input.name},`,
    "",
    `Paystack confirmed payment for order ${code}.`,
    "",
    ...itemLines,
    "",
    input.address,
    "",
    `Total ${formatPrice(input.total)}`,
    ...(input.orderUrl ? ["", `View the order: ${input.orderUrl}`] : []),
  ].join("\n");

  const rows = input.items
    .map((item) => {
      const line = formatPrice(item.unitPrice * item.quantity);
      return `<tr>
        <td style="padding:14px 0;border-bottom:1px solid #e4ddd0;vertical-align:top;">
          <p style="margin:0;font-family:${sans};font-size:14px;color:#1c1917;">${escapeHtml(item.name)}</p>
          <p style="margin:4px 0 0;font-family:${sans};font-size:12px;color:#6b6560;">${escapeHtml(formatPrice(item.unitPrice))} × ${item.quantity}</p>
        </td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid #e4ddd0;font-family:${sans};font-size:14px;color:#1c1917;vertical-align:top;">${escapeHtml(line)}</td>
      </tr>`;
    })
    .join("");

  const view = input.orderUrl ? actionButton(input.orderUrl, "View the order") : "";
  const address = escapeHtml(input.address).replaceAll("\n", "<br />");

  const html = emailShell({
    preheader: `Paystack confirmed payment for order ${code}.`,
    eyebrow: `Order ${code}`,
    title: "Payment received",
    body: `<p style="margin:0;">Hi ${escapeHtml(input.name)},</p>
      <p style="margin:12px 0 0;">Paystack confirmed payment for this order. The shop will get it ready for delivery.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid #e4ddd0;">
        ${rows || `<tr><td style="padding:14px 0;color:#6b6560;">No items were saved with this order.</td></tr>`}
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
        <tr>
          <td style="padding:14px 0 0;font-family:${sans};font-size:14px;color:#6b6560;">Total</td>
          <td align="right" style="padding:14px 0 0;font-family:${serif};font-size:22px;color:#1c1917;">${escapeHtml(formatPrice(input.total))}</td>
        </tr>
      </table>
      <p style="margin:22px 0 0;font-family:${sans};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b6560;">Deliver to</p>
      <p style="margin:8px 0 0;font-family:${sans};font-size:14px;line-height:1.6;color:#1c1917;">${address || "No address was saved."}</p>
      ${view}
      <p style="margin:16px 0 0;font-size:13px;color:#6b6560;">Paid with Paystack.</p>`,
  });

  return {
    subject: `Order ${code} from HNG Store`,
    text,
    html,
  };
}
