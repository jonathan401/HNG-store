import { formatPrice } from "@/lib/store/products";

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

function linkMessage(subject: string, intro: string, url: string, ignore: string) {
  const safeUrl = escapeHtml(url);
  return {
    subject,
    text: [intro, "", url, "", ignore].join("\n"),
    html: `<p>${escapeHtml(intro)}</p><p><a href="${safeUrl}">${escapeHtml(subject)}</a></p><p>${escapeHtml(ignore)}</p>`,
  };
}

export function signupMessage(url: string) {
  return linkMessage(
    "Confirm your HNG Store account",
    "Confirm your HNG Store account by opening this link:",
    url,
    "If you did not create an account, you can ignore this email.",
  );
}

export function recoveryMessage(url: string) {
  return linkMessage(
    "Reset your HNG Store password",
    "Choose a new HNG Store password by opening this link:",
    url,
    "If you did not ask to reset a password, you can ignore this email.",
  );
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
  const payment = "Paid with Paystack.";
  const text = [
    `Hi ${input.name},`,
    "",
    `We received payment for order ${code}.`,
    "",
    ...itemLines,
    "",
    input.address,
    "",
    `Total ${formatPrice(input.total)}`,
    payment,
    ...(input.orderUrl ? ["", `View the order: ${input.orderUrl}`] : []),
  ].join("\n");

  const itemsHtml = itemLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const view = input.orderUrl
    ? `<p><a href="${escapeHtml(input.orderUrl)}">View the order</a></p>`
    : "";
  const html = `<p>Hi ${escapeHtml(input.name)},</p><p>We received payment for order ${escapeHtml(code)}.</p><ul>${itemsHtml}</ul><p>${escapeHtml(input.address).replaceAll("\n", "<br />")}</p><p>Total ${escapeHtml(formatPrice(input.total))}</p><p>${escapeHtml(payment)}</p>${view}`;

  return {
    subject: `Order ${code} from HNG Store`,
    text,
    html,
  };
}
