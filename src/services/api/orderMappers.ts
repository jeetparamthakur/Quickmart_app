import type { OrderStatus } from '@/types/order';
import type { CustomerOrderDetail, OrderLineItem, OrderSubOrderGroup, OrderSummary } from '@/types/order';

const PARENT_STATUS_MAP: Record<string, OrderStatus> = {
  PLACED: 'placed',
  CONFIRMED: 'accepted',
  PARTIALLY_CANCELLED: 'preparing',
  CANCELLED: 'cancelled',
  COMPLETED: 'delivered',
};

const SUB_STATUS_LABELS: Record<string, string> = {
  PLACED: 'Placed',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for pickup',
  DELIVERY_ASSIGNED: 'Delivery assigned',
  PICKED_UP: 'Picked up',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  REFUND_PENDING: 'Refund pending',
  REFUNDED: 'Refunded',
};

export function parentStatusLabel(status: string): string {
  const key = status?.toUpperCase() ?? 'PLACED';
  const labels: Record<string, string> = {
    PLACED: 'Placed',
    CONFIRMED: 'Confirmed',
    ACCEPTED: 'Confirmed',
    PREPARING: 'Preparing',
    PARTIALLY_CANCELLED: 'Partially cancelled',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Delivered',
    DELIVERED: 'Delivered',
  };
  return labels[key] ?? key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function parseMoney(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
}

function resolveStoreNames(subOrders: Record<string, unknown>[]): string[] {
  const names: string[] = [];
  for (const so of subOrders) {
    const store = so.store as Record<string, unknown> | undefined;
    const ind = so.independentSeller as Record<string, unknown> | undefined;
    if (store?.name) names.push(String(store.name));
    else if (ind?.businessName) names.push(String(ind.businessName));
    else if (ind?.name) names.push(String(ind.name));
  }
  const unique = [...new Set(names)];
  if (unique.length) return unique;
  if (subOrders.length <= 1) return ['Store order'];
  return [`${subOrders.length} stores`];
}

function countItems(subOrders: Record<string, unknown>[]): number {
  return subOrders.reduce((total, so) => {
    const items = (so.items as Record<string, unknown>[] | undefined) ?? [];
    return total + items.reduce((q, item) => q + (Number(item.quantity) || 0), 0);
  }, 0);
}

function mapLineItem(item: Record<string, unknown>): OrderLineItem {
  const sp = item.sellerProduct as Record<string, unknown> | undefined;
  const mp = sp?.masterProduct as Record<string, unknown> | undefined;
  const name =
    (mp?.name as string) ??
    (sp?.title as string) ??
    'Item';

  return {
    id: String(item.id ?? item.sellerProductId ?? ''),
    name,
    quantity: Number(item.quantity) || 0,
    unitPrice: parseMoney(item.unitPrice),
    lineTotal: parseMoney(item.lineTotal),
  };
}

function mapSubOrder(so: Record<string, unknown>): OrderSubOrderGroup {
  const store = so.store as Record<string, unknown> | undefined;
  const ind = so.independentSeller as Record<string, unknown> | undefined;
  const status = String(so.status ?? 'PLACED');
  const items = ((so.items as Record<string, unknown>[] | undefined) ?? []).map(mapLineItem);

  return {
    id: String(so.id),
    storeName:
      (store?.name as string) ??
      (ind?.businessName as string) ??
      (ind?.name as string) ??
      undefined,
    status,
    statusLabel: SUB_STATUS_LABELS[status] ?? status,
    items,
  };
}

export function mapBackendOrderSummary(parent: Record<string, unknown>): OrderSummary {
  const subOrders = (parent.subOrders as Record<string, unknown>[] | undefined) ?? [];
  const statusKey = String(parent.status ?? 'PLACED').toUpperCase();

  return {
    id: String(parent.id),
    orderNumber: String(parent.orderNumber ?? parent.id),
    status: PARENT_STATUS_MAP[statusKey] ?? 'placed',
    createdAt: String(parent.createdAt ?? new Date().toISOString()),
    total: parseMoney(parent.totalPayable),
    storeNames: resolveStoreNames(subOrders),
    itemCount: countItems(subOrders),
  };
}

export function mapBackendOrderDetail(parent: Record<string, unknown>): CustomerOrderDetail {
  const subOrders = (parent.subOrders as Record<string, unknown>[] | undefined) ?? [];
  const statusKey = String(parent.status ?? 'PLACED').toUpperCase();

  return {
    id: String(parent.id),
    orderNumber: String(parent.orderNumber ?? parent.id),
    status: PARENT_STATUS_MAP[statusKey] ?? 'placed',
    statusLabel: parentStatusLabel(statusKey),
    paymentStatus: parent.paymentStatus ? String(parent.paymentStatus) : undefined,
    createdAt: String(parent.createdAt ?? new Date().toISOString()),
    total: parseMoney(parent.totalPayable),
    subtotal: parseMoney(parent.subtotal),
    deliveryFee: parseMoney(parent.deliveryFee),
    taxTotal: parseMoney(parent.taxTotal),
    discountTotal: parseMoney(parent.discountTotal),
    platformFee: parseMoney(parent.platformFee),
    subOrders: subOrders.map(mapSubOrder),
  };
}
