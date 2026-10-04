import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem } from '@/types/cart';
import type { CustomerOrderDetail, OrderSummary } from '@/types/order';

const STORAGE_KEY = 'quickmart-local-orders';

export type LocalOrderInput = {
  orderId: string;
  total: number;
  items: CartItem[];
};

function lineItemsFromCart(items: CartItem[]) {
  return items.map((item) => ({
    id: item.id,
    name: item.product.name,
    quantity: item.quantity,
    unitPrice: item.price,
    lineTotal: item.price * item.quantity,
  }));
}

function toDetail(input: LocalOrderInput): CustomerOrderDetail {
  const createdAt = new Date().toISOString();
  const lineItems = lineItemsFromCart(input.items);
  const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);
  const storeName = input.items[0]?.storeName ?? 'Store order';

  return {
    id: input.orderId,
    orderNumber: input.orderId,
    status: 'placed',
    statusLabel: 'Placed',
    createdAt,
    total: input.total,
    subtotal,
    deliveryFee: 0,
    taxTotal: 0,
    discountTotal: 0,
    platformFee: 0,
    subOrders: [
      {
        id: `${input.orderId}-sub`,
        storeName,
        status: 'PLACED',
        statusLabel: 'Placed',
        items: lineItems,
      },
    ],
    isLocal: true,
  };
}

function toSummary(detail: CustomerOrderDetail): OrderSummary {
  const itemCount = detail.subOrders.reduce(
    (n, g) => n + g.items.reduce((q, i) => q + i.quantity, 0),
    0,
  );
  const storeNames = [...new Set(detail.subOrders.map((g) => g.storeName).filter(Boolean) as string[])];
  return {
    id: detail.id,
    orderNumber: detail.orderNumber,
    status: detail.status,
    createdAt: detail.createdAt,
    total: detail.total,
    storeNames: storeNames.length ? storeNames : ['Store order'],
    itemCount,
  };
}

async function readAll(): Promise<CustomerOrderDetail[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomerOrderDetail[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(orders: CustomerOrderDetail[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export const localOrders = {
  async append(input: LocalOrderInput): Promise<CustomerOrderDetail> {
    const detail = toDetail(input);
    const existing = await readAll();
    await writeAll([detail, ...existing]);
    return detail;
  },

  async listSummaries(): Promise<OrderSummary[]> {
    const orders = await readAll();
    return orders.map(toSummary);
  },

  async getById(id: string): Promise<CustomerOrderDetail | null> {
    const orders = await readAll();
    return orders.find((o) => o.id === id || o.orderNumber === id) ?? null;
  },
};
