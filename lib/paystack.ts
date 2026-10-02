import { createHmac, timingSafeEqual } from "node:crypto";

const PAYSTACK_API = "https://api.paystack.co";

export function paystackSecret() {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  return secret || null;
}

export function toKobo(naira: number) {
  return Math.round(naira * 100);
}

export function isPaystackReference(reference: string) {
  return /^[A-Za-z0-9._-]{1,100}$/.test(reference);
}

export function isPaystackSignature(rawBody: string, signature: string | null) {
  const secret = paystackSecret();
  if (!secret || !signature) return false;
  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  const left = Buffer.from(digest);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

type PaystackInit =
  | { authorizationUrl: string; accessCode: string }
  | { error: string };

export async function initializePaystackTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  orderId: string;
}): Promise<PaystackInit> {
  const secret = paystackSecret();
  if (!secret) return { error: "Paystack is not configured." };
  if (input.amountKobo < 100) return { error: "Paystack needs a total of at least ₦1." };

  let response: Response;
  try {
    response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: "NGN",
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: { order_id: input.orderId },
      }),
    });
  } catch {
    return { error: "Could not reach Paystack." };
  }

  const payload = (await response.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; access_code?: string };
  } | null;
  const authorizationUrl = payload?.data?.authorization_url;
  const accessCode = payload?.data?.access_code;
  if (
    !response.ok ||
    !payload?.status ||
    typeof authorizationUrl !== "string" ||
    typeof accessCode !== "string"
  ) {
    return { error: payload?.message || "Paystack could not start the payment." };
  }
  return { authorizationUrl, accessCode };
}

export type PaystackVerification =
  | {
      status: string;
      amountKobo: number;
      currency: string;
      orderId: string | null;
    }
  | { error: string; unavailable?: boolean };

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerification> {
  const secret = paystackSecret();
  if (!secret) return { error: "Paystack is not configured.", unavailable: true };
  if (!isPaystackReference(reference)) return { error: "That Paystack reference is not valid." };

  let response: Response;
  try {
    response = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach Paystack.", unavailable: true };
  }

  const payload = (await response.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: {
      status?: string;
      amount?: number;
      currency?: string;
      metadata?: { order_id?: unknown } | null;
    };
  } | null;

  if (!response.ok || !payload?.status || !payload.data) {
    const unavailable = response.status >= 500 || response.status === 401 || response.status === 429;
    return {
      error: payload?.message || "Paystack could not verify the payment.",
      unavailable,
    };
  }

  const metadata = payload.data.metadata;
  const orderId =
    metadata && typeof metadata === "object" && typeof metadata.order_id === "string"
      ? metadata.order_id
      : null;

  return {
    status: payload.data.status ?? "",
    amountKobo: typeof payload.data.amount === "number" ? payload.data.amount : NaN,
    currency: (payload.data.currency ?? "").toUpperCase(),
    orderId,
  };
}
