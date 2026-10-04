import type { Order } from './cart';

export type { Order } from './cart';
export type OrderStatus = Order['status'];

export type OrderSummary = Pick<Order, 'id' | 'status' | 'createdAt' | 'total'> & {
  orderNumber: string;
  storeNames: string[];
  itemCount: number;
};

export type OrderLineItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderSubOrderGroup = {
  id: string;
  storeName?: string;
  status: string;
  statusLabel: string;
  items: OrderLineItem[];
};

export type CustomerOrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  paymentStatus?: string;
  createdAt: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  taxTotal: number;
  discountTotal: number;
  platformFee: number;
  subOrders: OrderSubOrderGroup[];
  isLocal?: boolean;
};
