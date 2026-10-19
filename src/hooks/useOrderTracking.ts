import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { OrderTrackingSnapshot } from '@/types/order-tracking';
import type { CustomerOrderDetail } from '@/types/order';
import {
  orderTrackingService,
  type TrackingFetchOptions,
} from '@/services/api/order-tracking.service';
import { ordersService } from '@/services/api/orders.service';

const POLL_MS = 5000;
const POLL_MS_FAST = 3000;
const FAST_POLL_WINDOW_MS = 60_000;

export type UseOrderTrackingOptions = TrackingFetchOptions & {
  /** Extra attempts when order may not be visible yet after checkout */
  postCheckoutRetry?: boolean;
};

export function useOrderTracking(orderId: string | undefined, options?: UseOrderTrackingOptions) {
  const [data, setData] = useState<OrderTrackingSnapshot | null>(null);
  const [orderDetail, setOrderDetail] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef(false);
  const mountedAtRef = useRef(Date.now());
  const initialFetchDoneRef = useRef(false);

  const deliveryLat = options?.deliveryOverride?.lat;
  const deliveryLng = options?.deliveryOverride?.lng;
  const deliveryLine = options?.deliveryOverride?.addressLine;
  const postCheckoutRetry = options?.postCheckoutRetry ?? false;

  const fetchTracking = useCallback(async () => {
    if (!orderId) return null;
    const deliveryOverride =
      deliveryLat != null && deliveryLng != null
        ? { lat: deliveryLat, lng: deliveryLng, addressLine: deliveryLine }
        : undefined;
    const fetchOpts: TrackingFetchOptions = { deliveryOverride };
    if (postCheckoutRetry && !initialFetchDoneRef.current) {
      return orderTrackingService.getTrackingWithRetry(orderId, {
        ...fetchOpts,
        retries: 3,
        retryDelayMs: 700,
      });
    }
    return orderTrackingService.getTracking(orderId, fetchOpts);
  }, [orderId, postCheckoutRetry, deliveryLat, deliveryLng, deliveryLine]);

  const refresh = useCallback(async () => {
    if (!orderId) {
      setData(null);
      setOrderDetail(null);
      setLoading(false);
      return;
    }
    try {
      const snapshot = await fetchTracking();
      initialFetchDoneRef.current = true;

      const detail = await ordersService.getById(orderId);

      if (!snapshot) {
        setError('not_found');
        setData(null);
      } else {
        setError(null);
        setData(snapshot);
        terminalRef.current = snapshot.isTerminal;
      }
      setOrderDetail(detail);
    } catch {
      setError('failed');
    } finally {
      setLoading(false);
    }
  }, [orderId, fetchTracking]);

  useEffect(() => {
    terminalRef.current = false;
    mountedAtRef.current = Date.now();
    initialFetchDoneRef.current = false;
    setLoading(true);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!orderId) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      if (terminalRef.current) return;
      const elapsed = Date.now() - mountedAtRef.current;
      const delay = elapsed < FAST_POLL_WINDOW_MS ? POLL_MS_FAST : POLL_MS;
      timeoutId = setTimeout(() => {
        void refresh();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active' && !terminalRef.current) {
        void refresh();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      sub.remove();
    };
  }, [orderId, refresh]);

  return {
    data,
    orderDetail,
    loading,
    error,
    refresh,
    headline: data ? orderTrackingService.headlineFor(data) : '',
  };
}
