export const FREE_DELIVERY_THRESHOLD = 50000;
export const DELIVERY_FEE = 3500;

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  badge?: string;
};

export function formatPrice(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function categoriesFrom(products: Product[]) {
  return [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
}

export function deliveryFee(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function relatedProducts(products: Product[], product: Product) {
  return products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
}
