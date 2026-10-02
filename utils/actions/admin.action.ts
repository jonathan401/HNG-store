"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteProduct,
  insertProduct,
  updateProduct,
  type ProductInput,
} from "@/lib/dal/products";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/dal/orders";
import { uploadProductImage } from "@/lib/dal/storage";
import { asInt, asMoney, type OrderStatus, type PaymentStatus } from "@/lib/dal/types";

function readProduct(formData: FormData): { input: ProductInput } | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const price = asMoney(formData.get("price"));
  const stock = asInt(formData.get("stock"));

  if (!name) return { error: "Add a product name." };
  if (!Number.isFinite(price) || price < 0) return { error: "Price has to be zero or more." };
  if (stock < 0) return { error: "Stock has to be zero or more." };

  return {
    input: {
      name,
      description: description || null,
      price,
      imageUrl: imageUrl || null,
      category: category || null,
      stock,
      isActive: formData.get("is_active") === "on",
    },
  };
}

function refreshCatalog(id?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/products/${id}`);
}

export async function saveProduct(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const parsed = readProduct(formData);
  if ("error" in parsed) return { error: parsed.error };

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadProductImage(imageFile);
    if ("error" in uploaded) return { error: uploaded.error ?? "Could not upload the image." };
    parsed.input.imageUrl = uploaded.url;
  }

  const id = String(formData.get("id") ?? "").trim();
  const result = id
    ? await updateProduct(id, parsed.input)
    : await insertProduct(parsed.input);

  if ("error" in result) return { error: result.error ?? "Could not save the product." };

  refreshCatalog(result.id);
  redirect(`/admin/products/${result.id}`);
}

export async function removeProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await deleteProduct(id);
  if ("error" in result) return;
  refreshCatalog(id);
  redirect("/admin/products");
}

const orderStatuses: OrderStatus[] = ["pending", "paid", "completed", "cancelled"];
const paymentStatuses: PaymentStatus[] = ["initiated", "success", "failed"];

export async function saveOrderStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!orderStatuses.includes(status)) return;
  await updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${id}`);
}

export async function savePaymentStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const orderId = String(formData.get("order_id") ?? "");
  const status = String(formData.get("status") ?? "") as PaymentStatus;
  if (!paymentStatuses.includes(status)) return;
  await updatePaymentStatus(id, status);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/account/orders/${orderId}`);
}
