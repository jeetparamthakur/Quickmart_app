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

function filterSyncableItems(items: CartItem[]): CartItem[] {
  return items.filter(
    (item) =>
      SELLER_PRODUCT_UUID.test(item.productId) &&
      !item.productId.startsWith('aaaaaaa0-') &&
      item.quantity > 0,
  );
}

type RemoteCartLine = { id: string; sellerProductId: string; quantity: number };

function flattenRemoteCart(cart: Record<string, unknown>): RemoteCartLine[] {
  const groups = cart.items;
  if (!Array.isArray(groups)) return [];
  const lines: RemoteCartLine[] = [];
  for (const group of groups) {
    const groupItems = (group as { items?: unknown[] }).items;
    if (!Array.isArray(groupItems)) continue;
    for (const row of groupItems) {
      const line = row as { id?: string; sellerProductId?: string; quantity?: number };
      if (!line.id || !line.sellerProductId) continue;
      lines.push({
        id: line.id,
        sellerProductId: line.sellerProductId,
        quantity: line.quantity ?? 0,
      });
    }
  }
  return lines;
}

let cartQueue: Promise<void> = Promise.resolve();

function runCartOp<T>(fn: () => Promise<T>): Promise<T> {
  const op = cartQueue.then(() => fn());
  cartQueue = op.then(
    () => undefined,
    () => undefined,
  );
  return op;
}

async function addItemRequest(sellerProductId: string, quantity: number) {
  return apiRequest('/customer/cart/items', {
    method: 'POST',
    body: { sellerProductId, quantity },
  });
}

async function updateItemRequest(itemId: string, quantity: number) {
  return apiRequest(`/customer/cart/items/${itemId}`, {
    method: 'PATCH',
    body: { quantity },
  });
}

async function removeItemRequest(itemId: string) {
  return apiRequest(`/customer/cart/items/${itemId}`, { method: 'DELETE' });
}

async function clearCartRequest() {
  return apiRequest('/customer/cart', { method: 'DELETE' });
}

async function previewRequest(couponCode?: string): Promise<BackendCartPreview> {
  return apiRequest<BackendCartPreview>('/customer/cart/preview', {
    method: 'POST',
    body: couponCode ? { couponCode } : {},
  });
}

async function syncItemsInternal(items: CartItem[]) {
  const syncable = filterSyncableItems(items);
  if (!syncable.length) {
    await clearCartRequest();
    return;
  }

  const desired = new Map<string, number>();
  for (const item of syncable) {
    desired.set(item.productId, (desired.get(item.productId) ?? 0) + item.quantity);
  }

  const remoteCart = await apiRequest<Record<string, unknown>>('/customer/cart');
  const remoteLines = flattenRemoteCart(remoteCart);

  for (const line of remoteLines) {
    const want = desired.get(line.sellerProductId) ?? 0;
    if (want === 0) {
      await removeItemRequest(line.id);
      continue;
    }
    if (want !== line.quantity) {
      await updateItemRequest(line.id, want);
    }
    desired.delete(line.sellerProductId);
  }

  for (const [sellerProductId, quantity] of desired) {
    await addItemRequest(sellerProductId, quantity);
  }
}

export const cartApi = {
  async getCart() {
    if (USE_MOCK) return null;
    return runCartOp(() => apiRequest<Record<string, unknown>>('/customer/cart'));
  },

  async addItem(sellerProductId: string, quantity = 1) {
    if (USE_MOCK) return null;
    return runCartOp(() => addItemRequest(sellerProductId, quantity));
  },

  async updateItem(itemId: string, quantity: number) {
    if (USE_MOCK) return null;
    return runCartOp(() => updateItemRequest(itemId, quantity));
  },

  async removeItem(itemId: string) {
    if (USE_MOCK) return null;
    return runCartOp(() => removeItemRequest(itemId));
  },

  async clearCart() {
    if (USE_MOCK) return null;
    return runCartOp(() => clearCartRequest());
  },

  async preview(couponCode?: string): Promise<BackendCartPreview | null> {
    if (USE_MOCK) return null;
    return runCartOp(() => previewRequest(couponCode));
  },

  async applyCoupon(code: string): Promise<BackendCartPreview | null> {
    if (USE_MOCK) return null;
    return runCartOp(() =>
      apiRequest<BackendCartPreview>('/customer/cart/coupon', {
        method: 'POST',
        body: { code },
      }),
    );
  },

  async removeCoupon(): Promise<BackendCartPreview | null> {
    if (USE_MOCK) return null;
    return runCartOp(() =>
      apiRequest<BackendCartPreview>('/customer/cart/coupon', { method: 'DELETE' }),
    );
  },

  async syncItems(items: CartItem[]) {
    if (USE_MOCK) return;
    return runCartOp(() => syncItemsInternal(items));
  },

  async syncAndPreview(items: CartItem[], couponCode?: string): Promise<BackendCartPreview | null> {
    if (USE_MOCK) return null;
    return runCartOp(async () => {
      await syncItemsInternal(items);
      return previewRequest(couponCode);
    });
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
