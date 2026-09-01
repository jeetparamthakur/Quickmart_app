import { useCartStore } from '@/store/cartStore';

export function useCart() {
  const store = useCartStore();
  return {
    items: store.items,
    itemCount: store.getItemCount(),
    groups: store.getGroups(),
    subtotal: store.getSubtotal(),
    deliveryFee: store.getDeliveryFee(),
    platformFee: store.getPlatformFee(),
    tax: store.getTax(),
    total: store.getTotal(),
    savings: store.getSavings(),
    couponCode: store.couponCode,
    couponDiscount: store.couponDiscount,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    getQuantity: store.getQuantity,
    applyCoupon: store.applyCoupon,
    clearCoupon: store.clearCoupon,
    clearCart: store.clearCart,
  };
}
