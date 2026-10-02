"use server";

import { revalidatePath } from "next/cache";
import { placeOrder as saveOrder } from "@/lib/dal/orders";
import type { PaymentProvider } from "@/lib/dal/types";

export async function placeOrder(input: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  provider: PaymentProvider | null;
  items: { productId: string; quantity: number }[];
}): Promise<
  | { error: string }
  | { id: string; total: number; email: string; provider: PaymentProvider | null }
> {
  const result = await saveOrder(input);
  if ("id" in result) {
    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/shop");
  }
  return result;
}
