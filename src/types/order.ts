export type { Order } from './cart';
export type OrderStatus = Order['status'];

import type { Order } from './cart';

export type OrderSummary = Pick<Order, 'id' | 'status' | 'createdAt' | 'total'> & {
  storeNames: string[];
  itemCount: number;
};
