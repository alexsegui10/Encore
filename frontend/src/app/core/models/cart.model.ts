export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface CartItem {
  itemType: 'event' | 'product';
  event?: any;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  updatedAt: string;
}

export interface CartResponse {
  cart: Cart;
}
