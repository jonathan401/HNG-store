export type CartItem = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
};

export type CartDraft = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
};
