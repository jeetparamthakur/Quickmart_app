import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { CartItem, PaymentMethod } from '@/types/cart';
import { USE_MOCK } from '@/constants/api';
import { cartApi } from './cart-api.service';

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

export const checkoutService = {
  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string } {
    const discount = VALID_COUPONS[code.toUpperCase()];
    if (!discount) return { valid: false, discount: 0, message: 'Invalid coupon code' };
    const applied = Math.min(discount, subtotal * 0.5);
    return { valid: true, discount: applied, message: `₹${applied} discount applied!` };
  },

  async getPreview() {
    if (USE_MOCK) return null;
    return cartApi.preview();
  },

  async placeOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
    if (USE_MOCK) {
      await simulateDelay(800, 1500);
      const subtotal = payload.items.reduce((s, i) => s + i.price * i.quantity, 0);
      let total = subtotal + 25 + Math.round(subtotal * 0.05) + Math.round(subtotal * 0.18);
      if (payload.couponCode) {
        const { discount } = this.validateCoupon(payload.couponCode, subtotal);
        total -= discount;
      }
      return {
        orderId: 'ORD-' + Date.now().toString().slice(-8),
        total: Math.round(total),
        estimatedDeliveryMinutes: 25,
      };
    }
    const preview = await cartApi.preview();
    const checkout = await apiRequest<{ parent: { id: string; orderNumber: string }; pricing?: { totalPayable: number } }>(
      '/customer/checkout',
      { method: 'POST', headers: { 'Idempotency-Key': `checkout-${Date.now()}` } },
    );
    const total = preview?.pricing.totalPayable ?? checkout.parent?.id ? 0 : 0;
    return {
      orderId: checkout.parent?.orderNumber ?? checkout.parent?.id ?? '',
      total: Math.round(total),
      estimatedDeliveryMinutes: 30,
    };
  },
};
