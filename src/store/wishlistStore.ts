import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wishlistService } from '@/services/api/wishlist.service';

type WishlistState = {
  productIds: string[];
  setFromServer: (ids: string[]) => void;
  clear: () => void;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      setFromServer: (ids) => set({ productIds: [...new Set(ids)] }),

      clear: () => set({ productIds: [] }),

      isWishlisted: (productId) => get().productIds.includes(productId),

      toggle: async (productId) => {
        const wasWishlisted = get().productIds.includes(productId);
        const snapshot = get().productIds;

        if (wasWishlisted) {
          set({ productIds: snapshot.filter((id) => id !== productId) });
        } else {
          set({ productIds: [...snapshot, productId] });
        }

        try {
          if (wasWishlisted) {
            await wishlistService.remove(productId);
          } else {
            await wishlistService.add(productId);
          }
        } catch {
          set({ productIds: snapshot });
          throw new Error('WISHLIST_TOGGLE_FAILED');
        }
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ productIds: state.productIds }),
    },
  ),
);
