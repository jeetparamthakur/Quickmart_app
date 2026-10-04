import type { OrderStatus } from '@/types/order';

export function isOrderTrackable(status: OrderStatus): boolean {
  return status !== 'delivered' && status !== 'cancelled';
}
