import { apiRequest, ApiClientError } from './client';
import { USE_MOCK } from '@/constants/api';
import { cartService as localCartService } from './cart.service';
import { CartItem } from '@/types/cart';

export type BackendCartPreview = {
  cart: { subtotal: string; items: unknown[]; itemCount: number; couponCode?: string | null };
  pricing: {
    subtotal: number;
    discountTotal: number;
    deliveryFee: number;
    charges?: Array<{ code: string; name: string; type: string; amount: number }>;
    platformFee: number;
    taxTotal: number;
    totalPayable: number;
    couponCode?: string;
  };
  coupon?: { code?: string; discount?: number };
};

export type ApplyCouponResult = {
  valid: boolean;
  discount: number;
  message: string;
  preview?: BackendCartPreview | null;
};

const SELLER_PRODUCT_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Seed/demo catalog IDs are not persisted on the backend cart. */
export function canSyncCartToBackend(items: CartItem[]): boolean {
  return items.some(
    (item) =>
      SELLER_PRODUCT_UUID.test(item.productId) &&
      !item.productId.startsWith('aaaaaaa0-') &&
      item.quantity > 0,
  );
}

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

  async clearCart() {
    if (USE_MOCK) return null;
    return apiRequest('/customer/cart', { method: 'DELETE' });
  },

  async preview(couponCode?: string): Promise<BackendCartPreview | null> {
    if (USE_MOCK) return null;
    return apiRequest<BackendCartPreview>('/customer/cart/preview', {
      method: 'POST',
      body: couponCode ? { couponCode } : {},
    });
  },

  async applyCoupon(code: string): Promise<BackendCartPreview | null> {
    if (USE_MOCK) return null;
    return apiRequest<BackendCartPreview>('/customer/cart/coupon', {
      method: 'POST',
      body: { code },
    });
  },

  async removeCoupon(): Promise<BackendCartPreview | null> {
    if (USE_MOCK) return null;
    return apiRequest<BackendCartPreview>('/customer/cart/coupon', { method: 'DELETE' });
  },

  async syncItems(items: CartItem[]) {
    if (USE_MOCK) return;
    const syncable = items.filter(
      (item) =>
        SELLER_PRODUCT_UUID.test(item.productId) &&
        !item.productId.startsWith('aaaaaaa0-') &&
        item.quantity > 0,
    );
    if (!syncable.length) return;
    await this.clearCart();
    for (const item of syncable) {
      await this.addItem(item.productId, item.quantity);
    }
  },

  calculateSummary(items: CartItem[], couponDiscount = 0) {
    return localCartService.calculateSummary(items, couponDiscount);
  },
};

export function couponErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    const body = error.appError as { message?: string; errorCode?: string };
    return body.message ?? 'Invalid coupon code';
  }
  return 'Invalid coupon code';
}
