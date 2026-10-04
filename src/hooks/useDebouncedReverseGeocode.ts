import { useEffect, useRef, useState } from 'react';
import { reverseGeocode } from '@/services/geocoding';
import type { AddressResult } from '@/utils/address';

const DEBOUNCE_MS = 450;

export function useDebouncedReverseGeocode(latitude: number, longitude: number) {
  const [result, setResult] = useState<AddressResult | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const hasCoords = latitude !== 0 || longitude !== 0;
    if (!hasCoords) {
      setResult(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;

    timerRef.current = setTimeout(async () => {
      try {
        const geocoded = await reverseGeocode(latitude, longitude);
        if (requestIdRef.current === requestId) {
          setResult(geocoded);
        }
      } catch {
        if (requestIdRef.current === requestId) {
          setResult(null);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [latitude, longitude]);

  return { result, loading };
}
