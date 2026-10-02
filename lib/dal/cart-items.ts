import { createClient } from "@/lib/supabase/server";
import { asInt, asMoney, type DbProduct } from "@/lib/dal/types";
import type { CartItem } from "@/lib/store/cart-item";

type CartRow = {
  quantity: number;
  products: Pick<DbProduct, "id" | "name" | "price" | "image_url" | "category" | "stock" | "is_active"> | null;
};

function toCartItem(row: CartRow): CartItem | null {
  const related = row.products as CartRow["products"] | CartRow["products"][] | null;
  const product = Array.isArray(related) ? related[0] : related;
  if (!product || !product.is_active) return null;
  const stock = asInt(product.stock);
  const quantity = Math.min(stock, asInt(row.quantity));
  if (quantity <= 0) return null;

  return {
    productId: product.id,
    quantity,
    name: product.name,
    price: asMoney(product.price),
    image: product.image_url ?? "",
    category: product.category?.trim() || "General",
    stock,
  };
}

export async function listMyCart(): Promise<CartItem[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", user.id)
    .order("added_at", { ascending: true });

  if (error || !data) return null;
  if (data.length === 0) return [];

  const ids = data.map((row) => row.product_id as string);
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name, price, image_url, category, stock, is_active")
    .in("id", ids);

  if (productError || !products) return null;

  const byId = new Map(
    (products as CartRow["products"][]).filter((product): product is NonNullable<CartRow["products"]> => Boolean(product)).map(
      (product) => [product.id, product],
    ),
  );

  return data.flatMap((row) => {
    const item = toCartItem({
      quantity: row.quantity,
      products: byId.get(row.product_id as string) ?? null,
    });
    return item ? [item] : [];
  });
}

export async function upsertMyCartItem(productId: string, quantity: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
    return;
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, stock, is_active")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product || !product.is_active) return;

  const nextQuantity = Math.min(asInt(product.stock), asInt(quantity));
  if (nextQuantity <= 0) {
    await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
    return;
  }

  await supabase.from("cart_items").upsert(
    {
      user_id: user.id,
      product_id: productId,
      quantity: nextQuantity,
    },
    { onConflict: "user_id,product_id" },
  );
}

export async function clearMyCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("cart_items").delete().eq("user_id", user.id);
}
