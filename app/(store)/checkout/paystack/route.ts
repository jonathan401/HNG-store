import { revalidatePath } from "next/cache";
import { after, NextResponse } from "next/server";
import { settlePaystackReference } from "@/lib/dal/orders";
import { requestOrigin } from "@/lib/mail/origin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = (await requestOrigin()) ?? url.origin;
  const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref") ?? "";
  const result = await settlePaystackReference(reference);

  if (result.outcome !== "paid" && result.outcome !== "failed" && result.outcome !== "pending") {
    return NextResponse.redirect(`${origin}/checkout?payment=missing`);
  }

  const orderId = result.orderId;
  after(() => {
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
  });

  const payment = result.outcome === "paid" ? "paid" : result.outcome === "pending" ? "pending" : "failed";
  const destination = `/account/orders/${result.orderId}?payment=${payment}`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?next=${encodeURIComponent(destination)}`);
  }
  return NextResponse.redirect(`${origin}${destination}`);
}
