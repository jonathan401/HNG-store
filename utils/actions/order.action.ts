"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  abandonUnpaidOrder as abandonOrder,
  placeOrder as saveOrder,
  startPaystackPayment as openPaystack,
} from "@/lib/dal/orders";

function refreshOrder(id: string) {
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/shop");
}

export async function placeOrder(input: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  items: { productId: string; quantity: number }[];
}): Promise<
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
  const result = await saveOrder(input);
  if ("id" in result) after(() => refreshOrder(result.id));
  return result;
}

export async function startPaystackPayment(orderId: string) {
  const result = await openPaystack(orderId);
  if ("authorizationUrl" in result) after(() => refreshOrder(orderId));
  return result;
}

export async function abandonUnpaidOrder(orderId: string) {
  const result = await abandonOrder(orderId);
  if (!("error" in result)) {
    after(() => {
      refreshOrder(orderId);
      revalidatePath("/");
      revalidatePath("/shop");
    });
  }
  return result;
}
