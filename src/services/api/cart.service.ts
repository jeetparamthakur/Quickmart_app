import { CartItem } from '@/types/cart';

export type CartChargeLine = {
  name: string;
  amount: number;
};

export type CartSummaryResult = {
  subtotal: number;
  deliveryFee: number;
  charges: CartChargeLine[];
  platformFee: number;
  tax: number;
  total: number;
  savings: number;
};

export const cartService = {
  calculateSummary(items: CartItem[], couponDiscount = 0): CartSummaryResult {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const storeIds = new Set(items.map((i) => i.storeId));
    const deliveryFee = storeIds.size * 15;
    const charges: CartChargeLine[] = [
      { name: 'Platform Fee', amount: 10 },
      { name: 'Handling Fee', amount: 15 },
    ];
    if (subtotal < 200) {
      charges.push({ name: 'Small Order Fee', amount: 20 });
    }
    const platformFee = charges.reduce((sum, c) => sum + c.amount, 0);
    const tax = Math.round(subtotal * 0.18);
    const savings =
      items.reduce((s, i) => {
        const orig = i.product.originalPrice ?? i.price;
        return s + (orig - i.price) * i.quantity;
      }, 0) + couponDiscount;
    const total = subtotal + deliveryFee + platformFee + tax - couponDiscount;
    return { subtotal, deliveryFee, charges, platformFee, tax, total, savings };
  },
};
