import { apiRequest, ApiClientError } from './client';
import { simulateDelay } from './utils';
import { CartItem, PaymentMethod } from '@/types/cart';
import { USE_MOCK } from '@/constants/api';
import { cartApi, couponErrorMessage } from './cart-api.service';

export type CheckoutPayload = {
  items: CartItem[];
  addressId: string;
  paymentMethod: PaymentMethod;
  deliveryInstructions?: string;
  couponCode?: string;
};

export type CheckoutResult = {
  orderId: string;
  total: number;
  estimatedDeliveryMinutes: number;
};

const VALID_COUPONS: Record<string, number> = {
  SAVE10: 10,
  FLAT50: 50,
  WELCOME: 100,
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isDummyCatalogId(id: string) {
  return id.startsWith('aaaaaaa0-');
}

function canUseBackendCart(items: CartItem[]) {
  return items.some((item) => UUID_RE.test(item.productId) && !isDummyCatalogId(item.productId) && item.quantity > 0);
}

function shouldUseLocalCheckout(error: unknown) {
  if (!(error instanceof ApiClientError)) return false;
  return error.appError.code === 'CART_EMPTY' || error.appError.code === 'PRODUCT_NOT_FOUND';
}

function localCheckout(payload: CheckoutPayload): CheckoutResult {
  const subtotal = payload.items.reduce((s, i) => s + i.price * i.quantity, 0);
  let total = subtotal + 25 + Math.round(subtotal * 0.05) + Math.round(subtotal * 0.18);
  if (payload.couponCode) {
    const { discount } = checkoutService.validateCouponLocal(payload.couponCode, subtotal);
    total -= discount;
  }
  return {
    orderId: 'ORD-' + Date.now().toString().slice(-8),
    total: Math.round(total),
    estimatedDeliveryMinutes: 25,
  };
}

export const checkoutService = {
  validateCouponLocal(code: string, subtotal: number): { valid: boolean; discount: number; message: string } {
    const discount = VALID_COUPONS[code.toUpperCase()];
    if (!discount) return { valid: false, discount: 0, message: 'Invalid coupon code' };
    const applied = Math.min(discount, subtotal * 0.5);
    return { valid: true, discount: applied, message: `₹${applied} discount applied!` };
  },

  async validateCoupon(
    code: string,
    items: CartItem[],
    subtotal: number,
  ): Promise<{ valid: boolean; discount: number; message: string }> {
    if (USE_MOCK || !canUseBackendCart(items)) {
      return checkoutService.validateCouponLocal(code, subtotal);
    }

    try {
      await cartApi.syncItems(items);
      const response = await cartApi.applyCoupon(code);
      const discount = response?.pricing.discountTotal ?? response?.coupon?.discount ?? 0;
      if (discount <= 0) {
        return { valid: false, discount: 0, message: 'Coupon could not be applied' };
      }
      return {
        valid: true,
        discount,
        message: `₹${Math.round(discount)} discount applied!`,
      };
    } catch (error) {
      return { valid: false, discount: 0, message: couponErrorMessage(error) };
    }
  },

  async clearCoupon(items: CartItem[]) {
    if (USE_MOCK || !canUseBackendCart(items)) return;
    try {
      await cartApi.syncItems(items);
      await cartApi.removeCoupon();
    } catch {
      // ignore — local state still clears
    }
  },

  async getPreview(items?: CartItem[]) {
    if (USE_MOCK || (items && !canUseBackendCart(items))) return null;
    if (items?.length) await cartApi.syncItems(items);
    return cartApi.preview();
  },

  async placeOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
    if (USE_MOCK || !canUseBackendCart(payload.items)) {
      await simulateDelay(800, 1500);
      return localCheckout(payload);
    }

    try {
      await cartApi.syncItems(payload.items);
      if (payload.couponCode) {
        try {
          await cartApi.applyCoupon(payload.couponCode);
        } catch {
          // checkout re-validates server-side from cart state
        }
      }
      const preview = await cartApi.preview();
      const checkout = await apiRequest<{
        parentOrder?: { id: string; orderNumber: string };
        parent?: { id: string; orderNumber: string };
        pricing?: { totalPayable: number };
      }>('/customer/checkout', {
        method: 'POST',
        headers: { 'Idempotency-Key': `checkout-${Date.now()}` },
      });

      const parent = checkout.parentOrder ?? checkout.parent;
      const total = preview?.pricing.totalPayable ?? checkout.pricing?.totalPayable ?? 0;
      return {
        orderId: parent?.orderNumber ?? parent?.id ?? '',
        total: Math.round(total),
        estimatedDeliveryMinutes: 30,
      };
    } catch (error) {
      if (shouldUseLocalCheckout(error)) {
        await simulateDelay(400, 800);
        return localCheckout(payload);
      }
      throw error;
    }
  },
};
