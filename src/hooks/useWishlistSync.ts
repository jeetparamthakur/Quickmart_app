import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { wishlistService } from '@/services/api/wishlist.service';

/** Loads wishlist product IDs from API when the user is authenticated. */
export function useWishlistSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHydrated = useAuthStore((s) => s.isHydrated);
  const setFromServer = useWishlistStore((s) => s.setFromServer);
  const clear = useWishlistStore((s) => s.clear);
  const lastFetch = useRef(0);

  useEffect(() => {
    if (!authHydrated) return;

    if (!isAuthenticated) {
      clear();
      return;
    }

    const now = Date.now();
    if (now - lastFetch.current < 2000) return;
    lastFetch.current = now;

    let cancelled = false;
    (async () => {
      try {
        const ids = await wishlistService.listIds();
        if (!cancelled) {
          setFromServer(ids);
        }
      } catch {
        // keep persisted local ids
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated, setFromServer, clear]);
}

export async function refreshWishlistFromApi() {
  const ids = await wishlistService.listIds();
  useWishlistStore.getState().setFromServer(ids);
  return ids;
}
