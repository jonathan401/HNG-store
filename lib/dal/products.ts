import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import type { Product } from "@/lib/store/products";
import { asInt, asMoney, type DbProduct } from "@/lib/dal/types";

export type ProductInput = {
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  stock: number;
  isActive: boolean;
};

function toProduct(row: DbProduct): Product {
  const stock = asInt(row.stock);
  return {
    id: row.id,
    name: row.name,
    category: row.category?.trim() || "General",
    price: asMoney(row.price),
    description: row.description ?? "",
    image: row.image_url ?? "",
    stock,
    badge: stock <= 0 ? "Sold out" : stock <= 3 ? "Few left" : undefined,
  };
}

export function toCatalogProduct(row: DbProduct): Product {
  return toProduct(row);
}

export const listActiveProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as DbProduct[]).map(toProduct);
});

export async function getActiveProduct(id: string) {
  const products = await listActiveProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function listAllProducts() {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

  const { data, error } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DbProduct[];
}

export async function getProductRecord(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

  const { data, error } = await admin.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DbProduct | null) ?? null;
}

export async function insertProduct(input: ProductInput) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return { error: "Missing SUPABASE_SERVICE_ROLE_KEY." };

  const { data, error } = await admin
    .from("products")
    .insert({
      name: input.name,
      description: input.description,
      price: input.price,
      image_url: input.imageUrl,
      category: input.category,
      stock: input.stock,
      is_active: input.isActive,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A product with that name already exists." };
    return { error: error.message };
  }

  return { id: data.id as string };
}

export async function updateProduct(id: string, input: ProductInput) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return { error: "Missing SUPABASE_SERVICE_ROLE_KEY." };

  const { error } = await admin
    .from("products")
    .update({
      name: input.name,
      description: input.description,
      price: input.price,
      image_url: input.imageUrl,
      category: input.category,
      stock: input.stock,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "A product with that name already exists." };
    return { error: error.message };
  }

  return { id };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return { error: "Missing SUPABASE_SERVICE_ROLE_KEY." };

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function adjustStock(productId: string, nextStock: number) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("products").update({ stock: nextStock }).eq("id", productId);
}
