export type OrderStatus = "pending" | "paid" | "completed" | "cancelled";
export type PaymentProvider = "paystack" | "flutterwave" | "stripe";
export type PaymentStatus = "initiated" | "success" | "failed";

export type DbProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  image_url: string | null;
  category: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
};

export type DbOrder = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number | string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  email_sent: boolean;
  created_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number | string;
  quantity: number;
};

export type DbPayment = {
  id: string;
  order_id: string;
  provider: PaymentProvider;
  reference: string | null;
  amount: number | string;
  status: PaymentStatus;
  created_at: string;
};

export type OrderRecord = {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  deliveryAddress: string | null;
  emailSent: boolean;
  createdAt: string;
  items: OrderItemRecord[];
  payments: PaymentRecord[];
};

export type OrderItemRecord = {
  id: string;
  productId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type PaymentRecord = {
  id: string;
  provider: PaymentProvider;
  reference: string | null;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
};

export function asMoney(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function asInt(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : 0;
}
