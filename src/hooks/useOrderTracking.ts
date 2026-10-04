import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { OrderTrackingSnapshot } from '@/types/order-tracking';
import { orderTrackingService } from '@/services/api/order-tracking.service';

const POLL_MS = 5000;

export function useOrderTracking(orderId: string | undefined) {
  const [data, setData] = useState<OrderTrackingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!orderId) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      const snapshot = await orderTrackingService.getTracking(orderId);
      if (!snapshot) {
        setError('not_found');
        setData(null);
      } else {
        setError(null);
        setData(snapshot);
        terminalRef.current = snapshot.isTerminal;
      }
    } catch {
      setError('failed');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    terminalRef.current = false;
    setLoading(true);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      if (terminalRef.current) return;
      void refresh();
    }, POLL_MS);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active' && !terminalRef.current) {
        void refresh();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [orderId, refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    headline: data ? orderTrackingService.headlineFor(data) : '',
  };
}
