import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { adjustStock } from "@/lib/dal/products";
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
  type PaymentProvider,
  type PaymentRecord,
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
  provider: PaymentProvider | null;
  items: { productId: string; quantity: number }[];
};

export async function placeOrder(input: PlaceOrderInput): Promise<
  | { error: string }
  | { id: string; total: number; email: string; provider: PaymentProvider | null }
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
    const admin = createAdminClient();
    if (admin) await admin.from("orders").delete().eq("id", orderId);
    return { error: itemsError.message };
  }

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  for (const line of lines) {
    const nextStock = asInt(line.product!.stock) - line.quantity;
    await adjustStock(line.product!.id, Math.max(0, nextStock));
  }

  if (input.provider) {
    const admin = createAdminClient();
    if (admin) {
      await admin.from("payments").insert({
        order_id: orderId,
        provider: input.provider,
        amount: total,
        status: "initiated",
      });
    }
  }

  return { id: orderId, total, email, provider: input.provider };
}
