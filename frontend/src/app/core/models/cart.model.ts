export interface CartItem {
  event: any;
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
