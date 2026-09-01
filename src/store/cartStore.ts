import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types/product';
import { CartItem, CartGroup } from '@/types/cart';

type CartState = {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  addItem: (product: Product, quantity?: number, storeId?: string, storeName?: string, price?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  getQuantity: (productId: string, storeId?: string) => number;
  getItemCount: () => number;
  getGroups: () => CartGroup[];
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getPlatformFee: () => number;
  getTax: () => number;
  getTotal: () => number;
  getSavings: () => number;
  applyCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  clearCart: () => void;
};

function makeItemId(productId: string, storeId: string) {
  return `${productId}-${storeId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (product, quantity = 1, storeId, storeName, price) => {
        const sid = storeId ?? product.storeId;
        const sname = storeName ?? product.storeName;
        const p = price ?? product.price;
        const itemId = makeItemId(product.id, sid);

        set((state) => {
          const existing = state.items.find((i) => i.id === itemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          const newItem: CartItem = {
            id: itemId,
            productId: product.id,
            product,
            storeId: sid,
            storeName: sname,
            quantity,
            price: p,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (itemId) => set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        }));
      },

      getQuantity: (productId, storeId) => {
        const sid = storeId ?? '';
        const item = get().items.find((i) => i.productId === productId && (!storeId || i.storeId === sid));
        return item?.quantity ?? 0;
      },

      getItemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),

      getGroups: () => {
        const groups: Record<string, CartGroup> = {};
        get().items.forEach((item) => {
          if (!groups[item.storeId]) {
            groups[item.storeId] = {
              storeId: item.storeId,
              storeName: item.storeName,
              items: [],
              subtotal: 0,
            };
          }
          groups[item.storeId].items.push(item);
          groups[item.storeId].subtotal += item.price * item.quantity;
        });
        return Object.values(groups);
      },

      getSubtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),

      getDeliveryFee: () => {
        const groups = get().getGroups();
        return groups.length * 15;
      },

      getPlatformFee: () => Math.round(get().getSubtotal() * 0.05),

      getTax: () => Math.round(get().getSubtotal() * 0.18),

      getTotal: () => {
        const sub = get().getSubtotal();
        return sub + get().getDeliveryFee() + get().getPlatformFee() + get().getTax() - get().couponDiscount;
      },

      getSavings: () => {
        return get().items.reduce((s, i) => {
          const orig = i.product.originalPrice ?? i.price;
          return s + (orig - i.price) * i.quantity;
        }, 0) + get().couponDiscount;
      },

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      clearCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
