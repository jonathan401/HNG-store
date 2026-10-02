"use server";

import { clearMyCart, listMyCart, upsertMyCartItem } from "@/lib/dal/cart-items";

export async function getServerCart() {
  return listMyCart();
}

export async function setCartItem(productId: string, quantity: number) {
  await upsertMyCartItem(productId, quantity);
}

export async function removeCartItem(productId: string) {
  await upsertMyCartItem(productId, 0);
}

export async function clearServerCart() {
  await clearMyCart();
}
