export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  inStock: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ProductPayload {
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  inStock: boolean;
}
