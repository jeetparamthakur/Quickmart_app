import { Product } from './product';

export type CartItem = {
  id: string;
  productId: string;
  product: Product;
  storeId: string;
  storeName: string;
  quantity: number;
  price: number;
};

export type CartGroup = {
  storeId: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
};

export type PaymentMethod = 'upi' | 'card' | 'wallet' | 'cod';

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: 'placed' | 'accepted' | 'preparing' | 'ready' | 'assigned' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
};
