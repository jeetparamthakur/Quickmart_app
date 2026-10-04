import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { addressService } from '@/services/api/address.service';

/** Loads saved addresses from API when the user is authenticated. */
export function useAddressSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHydrated = useAuthStore((s) => s.isHydrated);
  const setSavedAddresses = useLocationStore((s) => s.setSavedAddresses);
  const lastFetch = useRef(0);

  useEffect(() => {
    if (!authHydrated || !isAuthenticated) return;

    const now = Date.now();
    if (now - lastFetch.current < 2000) return;
    lastFetch.current = now;

    let cancelled = false;
    (async () => {
      try {
        const list = await addressService.list();
        if (!cancelled && list.length > 0) {
          setSavedAddresses(list);
        }
      } catch {
        // keep persisted local addresses
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated, setSavedAddresses]);
}

export async function refreshAddressesFromApi() {
  const list = await addressService.list();
  if (list.length > 0) {
    useLocationStore.getState().setSavedAddresses(list);
  }
  return list;
}
