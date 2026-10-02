import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { adjustStock } from "@/lib/dal/products";
import { sendMail } from "@/lib/mail/nodemailer";
import { orderMessage } from "@/lib/mail/messages";
import { requestOrigin } from "@/lib/mail/origin";
import {
  initializePaystackTransaction,
  isPaystackReference,
  paystackSecret,
  toKobo,
  verifyPaystackTransaction,
} from "@/lib/paystack";
import { isNigerianCapital } from "@/lib/store/nigeria";
import { deliveryFee } from "@/lib/store/products";
import {
  asInt,
  asMoney,
  type DbOrder,
  type DbOrderItem,
  type DbPayment,
  type OrderItemRecord,
  type OrderRecord,
  type OrderStatus,
  type PaymentRecord,
  type PaymentStatus,
} from "@/lib/dal/types";

const orderSelect = `
  id,
  user_id,
  status,
  total_amount,
  customer_name,
  customer_email,
  customer_phone,
  delivery_address,
  email_sent,
  created_at,
  order_items (
    id,
    order_id,
    product_id,
    product_name,
    unit_price,
    quantity
  ),
  payments (
    id,
    order_id,
    provider,
    reference,
    amount,
    status,
    created_at
  )
`;

type RawOrder = DbOrder & {
  order_items: DbOrderItem[] | null;
  payments: DbPayment[] | null;
};

function mapItem(row: DbOrderItem): OrderItemRecord {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.product_name,
    unitPrice: asMoney(row.unit_price),
    quantity: asInt(row.quantity),
  };
}

function mapPayment(row: DbPayment): PaymentRecord {
  return {
    id: row.id,
    provider: row.provider,
    reference: row.reference,
    amount: asMoney(row.amount),
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapOrder(row: RawOrder): OrderRecord {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    total: asMoney(row.total_amount),
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    deliveryAddress: row.delivery_address,
    emailSent: row.email_sent,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map(mapItem),
    payments: (row.payments ?? []).map(mapPayment),
  };
}

export async function listMyOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as RawOrder[]).map(mapOrder);
}

export async function getMyOrder(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapOrder(data as RawOrder) : null;
}

export async function listAllOrders() {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

  const { data, error } = await admin
    .from("orders")
    .select(orderSelect)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as RawOrder[]).map(mapOrder);
}

export async function getAnyOrder(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

  const { data, error } = await admin.from("orders").select(orderSelect).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOrder(data as RawOrder) : null;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return { error: "Missing SUPABASE_SERVICE_ROLE_KEY." };

  const { error } = await admin.from("orders").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function updatePaymentStatus(
  id: string,
  status: "initiated" | "success" | "failed",
) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return { error: "Missing SUPABASE_SERVICE_ROLE_KEY." };

  const { error } = await admin.from("payments").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  return { ok: true as const };
}

type PlaceOrderInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  items: { productId: string; quantity: number }[];
};

function paystackCallback(origin: string) {
  return `${origin}/checkout/paystack`;
}

async function discardOrder(orderId: string) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("payments").delete().eq("order_id", orderId);
  await admin.from("order_items").delete().eq("order_id", orderId);
  await admin.from("orders").delete().eq("id", orderId);
}

async function takeOrderStock(orderId: string) {
  const admin = createAdminClient();
  if (!admin) return;
  const { data: items } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    const productId = item.product_id as string | null;
    if (!productId) continue;
    const { data: product } = await admin
      .from("products")
      .select("stock")
      .eq("id", productId)
      .maybeSingle();
    if (!product) continue;
    await adjustStock(productId, Math.max(0, asInt(product.stock) - asInt(item.quantity)));
  }
}

async function restoreOrderStock(orderId: string) {
  const admin = createAdminClient();
  if (!admin) return;
  const { data: items } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    const productId = item.product_id as string | null;
    if (!productId) continue;
    const { data: product } = await admin
      .from("products")
      .select("stock")
      .eq("id", productId)
      .maybeSingle();
    if (!product) continue;
    await adjustStock(productId, asInt(product.stock) + asInt(item.quantity));
  }
}

async function releasePendingOrder(orderId: string) {
  const admin = createAdminClient();
  if (!admin) return;
  const { data: payments } = await admin.from("payments").select("status").eq("order_id", orderId);
  if ((payments ?? []).some((payment) => payment.status === "success")) return;

  const { data: claimed } = await admin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (!claimed) return;

  await restoreOrderStock(orderId);
  await admin.from("payments").update({ status: "failed" }).eq("order_id", orderId).neq("status", "success");
}

async function releaseMyPendingOrders(userId: string) {
  const admin = createAdminClient();
  if (!admin) return;
  const { data } = await admin.from("orders").select("id").eq("user_id", userId).eq("status", "pending");
  for (const order of data ?? []) {
    await releasePendingOrder(order.id as string);
  }
}

async function clearCartForOrder(orderId: string) {
  const admin = createAdminClient();
  if (!admin) return;
  const { data: order } = await admin.from("orders").select("user_id").eq("id", orderId).maybeSingle();
  const userId = order?.user_id as string | undefined;
  if (!userId) return;
  await admin.from("cart_items").delete().eq("user_id", userId);
}

async function beginPaystackPayment(input: {
  orderId: string;
  email: string;
  amountNaira: number;
  callbackUrl: string;
}): Promise<{ authorizationUrl: string; accessCode: string; reference: string } | { error: string }> {
  if (!paystackSecret()) return { error: "Paystack is not configured." };
  const admin = createAdminClient();
  if (!admin) return { error: "Missing SUPABASE_SERVICE_ROLE_KEY." };

  const reference = crypto.randomUUID();
  const { error } = await admin.from("payments").insert({
    order_id: input.orderId,
    provider: "paystack",
    reference,
    amount: input.amountNaira,
    status: "initiated",
  });
  if (error) return { error: error.message };

  const started = await initializePaystackTransaction({
    email: input.email,
    amountKobo: toKobo(input.amountNaira),
    reference,
    callbackUrl: input.callbackUrl,
    orderId: input.orderId,
  });
  if ("error" in started) {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return started;
  }
  return { ...started, reference };
}

async function sendPaidOrderEmail(orderId: string) {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: claimed, error: claimError } = await admin
    .from("orders")
    .update({ email_sent: true })
    .eq("id", orderId)
    .eq("email_sent", false)
    .select("id, customer_name, customer_email, total_amount, delivery_address");

  if (claimError || !claimed?.length) return;
  const order = claimed[0] as {
    customer_name: string;
    customer_email: string;
    total_amount: number | string;
    delivery_address: string | null;
  };

  const { data: itemRows } = await admin
    .from("order_items")
    .select("product_name, quantity, unit_price")
    .eq("order_id", orderId);

  try {
    const origin = await requestOrigin();
    const mailed = await sendMail({
      to: order.customer_email,
      ...orderMessage({
        name: order.customer_name,
        orderId,
        total: asMoney(order.total_amount),
        address: order.delivery_address ?? "",
        items: (
          (itemRows ?? []) as {
            product_name: string;
            quantity: number;
            unit_price: number | string;
          }[]
        ).map((item) => ({
          name: item.product_name,
          quantity: asInt(item.quantity),
          unitPrice: asMoney(item.unit_price),
        })),
        orderUrl: origin ? `${origin}/account/orders/${orderId}` : null,
      }),
    });
    if (!mailed.ok) {
      console.error("Order confirmation email failed", mailed.error);
      await admin.from("orders").update({ email_sent: false }).eq("id", orderId);
    }
  } catch (error) {
    console.error(
      "Order confirmation email failed",
      error instanceof Error ? error.message : "unknown error",
    );
    await admin.from("orders").update({ email_sent: false }).eq("id", orderId);
  }
}

export async function settlePaystackReference(reference: string): Promise<
  | { outcome: "paid" | "failed" | "pending"; orderId: string }
  | { outcome: "missing" | "unconfigured" | "unavailable" }
> {
  if (!isPaystackReference(reference)) return { outcome: "missing" };
  if (!paystackSecret()) return { outcome: "unconfigured" };
  const admin = createAdminClient();
  if (!admin) return { outcome: "unconfigured" };

  const { data, error } = await admin
    .from("payments")
    .select("id, order_id, amount, status")
    .eq("reference", reference)
    .maybeSingle();
  if (error) return { outcome: "unavailable" };
  if (!data) return { outcome: "missing" };

  const payment = data as {
    id: string;
    order_id: string;
    amount: number | string;
    status: PaymentStatus;
  };
  const verified = await verifyPaystackTransaction(reference);
  if ("error" in verified) {
    if (verified.unavailable) return { outcome: "unavailable" };
    if (payment.status !== "success") {
      await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    }
    return { outcome: "failed", orderId: payment.order_id };
  }

  const expected = toKobo(asMoney(payment.amount));
  const matches =
    verified.status === "success" &&
    verified.currency === "NGN" &&
    verified.amountKobo === expected &&
    (!verified.orderId || verified.orderId === payment.order_id);

  if (matches) {
    const { data: paidOrder } = await admin
      .from("orders")
      .update({ status: "paid" })
      .eq("id", payment.order_id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    let claimed = Boolean(paidOrder);
    if (!claimed) {
      const { data: revived } = await admin
        .from("orders")
        .update({ status: "paid" })
        .eq("id", payment.order_id)
        .eq("status", "cancelled")
        .select("id")
        .maybeSingle();
      if (revived) {
        await takeOrderStock(payment.order_id);
        claimed = true;
      }
    }
    await admin.from("payments").update({ status: "success" }).eq("id", payment.id);
    if (claimed) {
      await clearCartForOrder(payment.order_id);
      const orderId = payment.order_id;
      after(() => sendPaidOrderEmail(orderId));
    }
    return { outcome: "paid", orderId: payment.order_id };
  }

  if (verified.status === "success") {
    if (payment.status !== "success") {
      console.error("Paystack payment did not match this order", reference);
      await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    }
    return { outcome: "failed", orderId: payment.order_id };
  }

  if (verified.status === "abandoned" || verified.status === "failed" || verified.status === "reversed") {
    if (payment.status !== "success") {
      await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    }
    await releasePendingOrder(payment.order_id);
    return { outcome: "failed", orderId: payment.order_id };
  }

  return { outcome: "pending", orderId: payment.order_id };
}

export async function startPaystackPayment(orderId: string): Promise<
  { error: string } | { authorizationUrl: string; accessCode: string; reference: string }
> {
  const order = await getMyOrder(orderId);
  if (!order) return { error: "Sign in to pay for this order." };
  if (order.status === "cancelled") return { error: "This order was cancelled." };
  if (
    order.status === "paid" ||
    order.status === "completed" ||
    order.payments.some((payment) => payment.status === "success")
  ) {
    return { error: "This order is already paid." };
  }

  const origin = await requestOrigin();
  if (!origin) return { error: "Could not build the Paystack return link." };
  return beginPaystackPayment({
    orderId: order.id,
    email: order.customerEmail,
    amountNaira: order.total,
    callbackUrl: paystackCallback(origin),
  });
}

export async function abandonUnpaidOrder(orderId: string): Promise<
  { error: string } | { ok: true; paid: boolean }
> {
  const order = await getMyOrder(orderId);
  if (!order) return { error: "That order could not be found." };
  if (
    order.status === "paid" ||
    order.status === "completed" ||
    order.payments.some((payment) => payment.status === "success")
  ) {
    return { ok: true, paid: true };
  }
  if (order.status === "cancelled") return { ok: true, paid: false };

  const reference = [...order.payments].reverse().find((payment) => payment.reference)?.reference;
  if (reference) {
    const settled = await settlePaystackReference(reference);
    if (settled.outcome === "paid") return { ok: true, paid: true };
  }

  await releasePendingOrder(orderId);
  return { ok: true, paid: false };
}

export async function placeOrder(input: PlaceOrderInput): Promise<
  | { error: string }
  | {
      id: string;
      total: number;
      email: string;
      authorizationUrl: string;
      accessCode: string;
      reference: string;
    }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to place an order." };

  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const address = input.address.trim();
  const city = input.city.trim();
  const note = input.note.trim();

  if (!name || !email || !phone || !address || !city) {
    return { error: "Add your name, email, phone, address, and city." };
  }
  if (!isNigerianCapital(city)) return { error: "Choose a state capital." };
  if (!email.includes("@")) return { error: "That email does not look complete." };
  if (input.items.length === 0) return { error: "Your bag is empty." };
  if (!paystackSecret()) return { error: "Paystack is not configured." };
  if (!hasServiceRole()) return { error: "Missing SUPABASE_SERVICE_ROLE_KEY." };

  await releaseMyPendingOrders(user.id);

  const ids = [...new Set(input.items.map((item) => item.productId))];
  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active")
    .in("id", ids);

  if (productError) return { error: productError.message };

  const products = new Map(
    ((productRows ?? []) as { id: string; name: string; price: number | string; stock: number; is_active: boolean }[]).map(
      (row) => [row.id, row],
    ),
  );

  const lines = input.items.map((item) => {
    const product = products.get(item.productId);
    const quantity = asInt(item.quantity);
    return { item, product, quantity };
  });

  if (lines.some((line) => !line.product || !line.product.is_active || line.quantity <= 0)) {
    return { error: "A product in your bag is no longer available." };
  }

  const short = lines.find((line) => line.product && line.quantity > asInt(line.product.stock));
  if (short?.product) {
    return { error: `Only ${asInt(short.product.stock)} ${short.product.name} left in stock.` };
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + asMoney(line.product!.price) * line.quantity,
    0,
  );
  const shipping = deliveryFee(subtotal);
  const total = subtotal + shipping;
  const deliveryAddress = [address, city, note].filter(Boolean).join("\n");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total_amount: total,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      delivery_address: deliveryAddress,
    })
    .select("id")
    .single();

  if (orderError) {
    if (orderError.code === "23503") {
      return { error: "Your account is missing a profile, so the order could not be saved." };
    }
    return { error: orderError.message };
  }

  const orderId = order.id as string;
  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((line) => ({
      order_id: orderId,
      product_id: line.product!.id,
      product_name: line.product!.name,
      unit_price: asMoney(line.product!.price),
      quantity: line.quantity,
    })),
  );

  if (itemsError) {
    await discardOrder(orderId);
    return { error: itemsError.message };
  }

  const origin = await requestOrigin();
  if (!origin) {
    await discardOrder(orderId);
    return { error: "Could not build the Paystack return link." };
  }

  const started = await beginPaystackPayment({
    orderId,
    email,
    amountNaira: total,
    callbackUrl: paystackCallback(origin),
  });
  if ("error" in started) {
    await discardOrder(orderId);
    return started;
  }

  await Promise.all(
    lines.map((line) =>
      adjustStock(line.product!.id, Math.max(0, asInt(line.product!.stock) - line.quantity)),
    ),
  );

  return {
    id: orderId,
    total,
    email,
    authorizationUrl: started.authorizationUrl,
    accessCode: started.accessCode,
    reference: started.reference,
  };
}
