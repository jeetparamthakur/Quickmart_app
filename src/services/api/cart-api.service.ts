import { apiRequest } from './client';
import { USE_MOCK } from '@/constants/api';
import { cartService as localCartService } from './cart.service';
import { CartItem } from '@/types/cart';

export type BackendCartPreview = {
  cart: { subtotal: string; items: unknown[]; itemCount: number };
  pricing: {
    subtotal: number;
    discountTotal: number;
    deliveryFee: number;
    platformFee: number;
    taxTotal: number;
    totalPayable: number;
  };
};

export const cartApi = {
  async getCart() {
    if (USE_MOCK) return null;
    return apiRequest<Record<string, unknown>>('/customer/cart');
  },

  async addItem(sellerProductId: string, quantity = 1) {
    if (USE_MOCK) return null;
    return apiRequest('/customer/cart/items', {
      method: 'POST',
      body: { sellerProductId, quantity },
    });
  },

  async updateItem(itemId: string, quantity: number) {
    if (USE_MOCK) return null;
    return apiRequest(`/customer/cart/items/${itemId}`, {
      method: 'PATCH',
      body: { quantity },
    });
  },

  async removeItem(itemId: string) {
    if (USE_MOCK) return null;
    return apiRequest(`/customer/cart/items/${itemId}`, { method: 'DELETE' });
  },

  async preview(): Promise<BackendCartPreview | null> {
    if (USE_MOCK) return null;
    return apiRequest<BackendCartPreview>('/customer/cart/preview', { method: 'POST' });
  },

  calculateSummary(items: CartItem[], couponDiscount = 0) {
    return localCartService.calculateSummary(items, couponDiscount);
  },
};
