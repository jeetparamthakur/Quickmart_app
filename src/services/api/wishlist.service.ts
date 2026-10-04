import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { mapBackendProduct } from './mappers';
import { Product } from '@/types/product';
import { USE_MOCK } from '@/constants/api';

const mockIds = new Set<string>();

export const wishlistService = {
  async list(): Promise<Product[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const { products } = await import('../mock/data');
      return products.filter((p) => mockIds.has(p.id));
    }
    const res = await apiRequest<{ items: Record<string, unknown>[] }>('/customer/wishlist');
    return res.items.map(mapBackendProduct);
  },

  async listIds(): Promise<string[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return [...mockIds];
    }
    const res = await apiRequest<{ productIds: string[] }>('/customer/wishlist/ids');
    return res.productIds;
  },

  async add(sellerProductId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      mockIds.add(sellerProductId);
      return;
    }
    await apiRequest('/customer/wishlist/items', {
      method: 'POST',
      body: { sellerProductId },
    });
  },

  async remove(sellerProductId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      mockIds.delete(sellerProductId);
      return;
    }
    await apiRequest(`/customer/wishlist/items/${sellerProductId}`, {
      method: 'DELETE',
    });
  },
};
