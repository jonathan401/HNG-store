"use server";

import { revalidatePath } from "next/cache";
import { clearMyCart, listMyCart, upsertMyCartItem } from "@/lib/dal/cart-items";

export async function getServerCart() {
  return listMyCart();
}

export async function setCartItem(productId: string, quantity: number) {
  await upsertMyCartItem(productId, quantity);
  revalidatePath("/checkout");
}

export async function removeCartItem(productId: string) {
  await upsertMyCartItem(productId, 0);
}

export async function clearServerCart() {
  await clearMyCart();
}
