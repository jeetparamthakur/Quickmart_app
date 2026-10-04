import { useEffect, useMemo, useState } from 'react';
import { USE_MOCK } from '@/constants/api';
import { canSyncCartToBackend, cartApi } from '@/services/api/cart-api.service';
import { cartService } from '@/services/api/cart.service';
import { useCartStore } from '@/store/cartStore';

export type CartChargeLine = {
  code?: string;
  name: string;
  amount: number;
};

export type CartPricing = {
  subtotal: number;
  deliveryFee: number;
  charges: CartChargeLine[];
  platformFee: number;
  tax: number;
  total: number;
  savings: number;
  couponDiscount: number;
  loading: boolean;
};

function buildLocalPricing(
  items: ReturnType<typeof useCartStore.getState>['items'],
  couponDiscount: number,
): CartPricing {
  const summary = cartService.calculateSummary(items, couponDiscount);
  return {
    subtotal: summary.subtotal,
    deliveryFee: summary.deliveryFee,
    charges: summary.charges,
    platformFee: summary.platformFee,
    tax: summary.tax,
    total: summary.total,
    savings: summary.savings,
    couponDiscount,
    loading: false,
  };
}

export function useCartPricing(): CartPricing {
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const couponDiscount = useCartStore((s) => s.couponDiscount);
  const [remote, setRemote] = useState<CartPricing | null>(null);
  const [loading, setLoading] = useState(false);

  const local = useMemo(
    () => buildLocalPricing(items, couponDiscount),
    [items, couponDiscount],
  );

  useEffect(() => {
    if (USE_MOCK || items.length === 0 || !canSyncCartToBackend(items)) {
      setRemote(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        await cartApi.syncItems(items);
        const preview = await cartApi.preview(couponCode ?? undefined);
        if (cancelled || !preview) return;

        const charges: CartChargeLine[] = (preview.pricing.charges ?? []).map((c) => ({
          code: c.code,
          name: c.name,
          amount: c.amount,
        }));

        const discount = preview.pricing.discountTotal ?? 0;

        setRemote({
          subtotal: preview.pricing.subtotal,
          deliveryFee: preview.pricing.deliveryFee,
          charges,
          platformFee: preview.pricing.platformFee,
          tax: preview.pricing.taxTotal,
          total: preview.pricing.totalPayable,
          savings: local.savings,
          couponDiscount: discount,
          loading: false,
        });
      } catch {
        if (!cancelled) setRemote(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [items, couponCode, local.savings]);

  if (remote) {
    return { ...remote, loading };
  }

  return { ...local, loading };
}
