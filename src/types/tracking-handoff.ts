import type { PaymentMethod } from '@/types/cart';

/** Checkout → success → track route params for optimistic UI */
export type TrackingHandoffParams = {
  orderNumber?: string;
  etaMinutes?: string;
  itemCount?: string;
  paymentMethod?: PaymentMethod;
  addressLabel?: string;
  addressLine?: string;
  deliveryLat?: string;
  deliveryLng?: string;
};

export function parseDeliveryOverride(params: TrackingHandoffParams) {
  const lat = params.deliveryLat ? Number(params.deliveryLat) : NaN;
  const lng = params.deliveryLng ? Number(params.deliveryLng) : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return {
    lat,
    lng,
    addressLine: params.addressLine,
  };
}
