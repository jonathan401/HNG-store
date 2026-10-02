"use server";

import { getActiveProduct, listActiveProducts } from "@/lib/dal/products";

export async function getProducts() {
  return listActiveProducts();
}

export async function getProduct(id: string) {
  return getActiveProduct(id);
}
