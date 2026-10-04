import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { USE_MOCK } from '@/constants/api';
import { localOrders } from '@/services/localOrders';
import type { CustomerOrderDetail, OrderSummary } from '@/types/order';
import { mapBackendOrderDetail, mapBackendOrderSummary } from './orderMappers';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function fetchApiList(): Promise<OrderSummary[]> {
  const rows = await apiRequest<Record<string, unknown>[]>('/customer/orders');
  return (rows ?? []).map(mapBackendOrderSummary);
}

async function fetchApiDetail(id: string): Promise<CustomerOrderDetail> {
  const row = await apiRequest<Record<string, unknown>>(`/customer/orders/${id}`);
  return mapBackendOrderDetail(row);
}

export const ordersService = {
  async list(): Promise<OrderSummary[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return localOrders.listSummaries();
    }

    try {
      return await fetchApiList();
    } catch {
      return localOrders.listSummaries();
    }
  },

  async getById(id: string): Promise<CustomerOrderDetail | null> {
    if (USE_MOCK) {
      await simulateDelay();
      return localOrders.getById(id);
    }

    const local = await localOrders.getById(id);
    if (local) return local;

    if (UUID_RE.test(id)) {
      try {
        return await fetchApiDetail(id);
      } catch {
        return localOrders.getById(id);
      }
    }

    return localOrders.getById(id);
  },
};
