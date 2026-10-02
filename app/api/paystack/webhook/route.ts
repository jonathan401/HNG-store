import { revalidatePath } from "next/cache";
import { settlePaystackReference } from "@/lib/dal/orders";
import { isPaystackSignature } from "@/lib/paystack";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!isPaystackSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody) as { event?: string; data?: { reference?: string } };
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const reference = event.data?.reference;
  if (!event.event?.startsWith("charge.") || !reference) {
    return new Response("ok");
  }

  const result = await settlePaystackReference(reference);
  if (result.outcome === "unconfigured" || result.outcome === "unavailable") {
    return new Response("Paystack settlement unavailable", { status: 500 });
  }
  if ("orderId" in result) {
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${result.orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${result.orderId}`);
  }
  return new Response("ok");
}
