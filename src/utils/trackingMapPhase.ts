import type { OrderTrackingSnapshot, TrackingSubOrder } from '@/types/order-tracking';

export type TrackingMapPhase =
  | 'awaiting_partner'
  | 'partner_to_store'
  | 'out_for_delivery'
  | 'delivered';

function subHasPartner(sub: TrackingSubOrder): boolean {
  if (!sub.partner) return false;
  return Number.isFinite(sub.partner.lat) && Number.isFinite(sub.partner.lng);
}

function isOutForDeliverySub(sub: TrackingSubOrder): boolean {
  const status = sub.status.toUpperCase();
  return status === 'PICKED_UP' || status === 'OUT_FOR_DELIVERY';
}

function isPartnerEnRouteToStore(sub: TrackingSubOrder): boolean {
  if (!subHasPartner(sub)) return false;
  const status = sub.status.toUpperCase();
  if (isOutForDeliverySub(sub) || status === 'DELIVERED') return false;
  const assignment = sub.assignmentStatus?.toUpperCase();
  return (
    status === 'DELIVERY_ASSIGNED' ||
    assignment === 'ACCEPTED' ||
    assignment === 'IN_PROGRESS' ||
    sub.status.toLowerCase() === 'partner_assigned'
  );
}

export function shouldShowRiderMarker(sub: TrackingSubOrder, phase: TrackingMapPhase): boolean {
  if (!subHasPartner(sub)) return false;
  if (phase === 'partner_to_store' || phase === 'out_for_delivery') return true;
  const status = sub.status.toUpperCase();
  const assignment = sub.assignmentStatus?.toUpperCase();
  return (
    status === 'DELIVERY_ASSIGNED' ||
    assignment === 'ACCEPTED' ||
    assignment === 'IN_PROGRESS' ||
    isOutForDeliverySub(sub)
  );
}

export function shouldShowStoreMarker(sub: TrackingSubOrder, phase: TrackingMapPhase): boolean {
  const status = sub.status.toUpperCase();
  if (status === 'DELIVERED' || phase === 'delivered') return false;
  if (phase === 'out_for_delivery') return false;
  return status !== 'PICKED_UP' && status !== 'OUT_FOR_DELIVERY';
}

export function shouldShowCustomerMarker(phase: TrackingMapPhase): boolean {
  return phase === 'out_for_delivery' || phase === 'delivered';
}

export function getTrackingMapPhase(snapshot: OrderTrackingSnapshot): TrackingMapPhase {
  if (snapshot.isTerminal || snapshot.stages.current === 'delivered') {
    return 'delivered';
  }

  const current = snapshot.stages.current;
  if (current === 'picked_up' || current === 'on_the_way') {
    return 'out_for_delivery';
  }

  const anyOut = snapshot.subOrders.some(isOutForDeliverySub);
  if (anyOut) return 'out_for_delivery';

  const anyEnRouteStore = snapshot.subOrders.some(isPartnerEnRouteToStore);
  if (anyEnRouteStore || current === 'partner_assigned') {
    return 'partner_to_store';
  }

  const hasPartner = snapshot.subOrders.some(subHasPartner);
  if (hasPartner) return 'partner_to_store';

  return 'awaiting_partner';
}

export type MapRouteSegment = {
  from: { latitude: number; longitude: number };
  to: { latitude: number; longitude: number };
};

export function getMapRouteSegments(
  snapshot: OrderTrackingSnapshot,
  phase: TrackingMapPhase,
): MapRouteSegment[] {
  const segments: MapRouteSegment[] = [];
  if (phase !== 'partner_to_store' && phase !== 'out_for_delivery') return segments;

  const delivery = {
    latitude: snapshot.delivery.lat,
    longitude: snapshot.delivery.lng,
  };

  for (const sub of snapshot.subOrders) {
    if (!shouldShowRiderMarker(sub, phase) || !sub.partner) continue;
    const partner = { latitude: sub.partner.lat, longitude: sub.partner.lng };
    const store = { latitude: sub.pickup.lat, longitude: sub.pickup.lng };

    if (phase === 'partner_to_store') {
      segments.push({ from: partner, to: store });
    } else if (phase === 'out_for_delivery') {
      segments.push({ from: partner, to: delivery });
    }
  }

  return segments;
}

export function getMapFocusCoordinates(
  snapshot: OrderTrackingSnapshot,
  phase: TrackingMapPhase,
): { latitude: number; longitude: number }[] {
  const coords: { latitude: number; longitude: number }[] = [];

  if (phase === 'awaiting_partner') {
    for (const sub of snapshot.subOrders) {
      if (shouldShowStoreMarker(sub, phase)) {
        coords.push({ latitude: sub.pickup.lat, longitude: sub.pickup.lng });
      }
    }
    if (coords.length === 0 && snapshot.delivery.lat) {
      coords.push({ latitude: snapshot.delivery.lat, longitude: snapshot.delivery.lng });
    }
    return coords;
  }

  if (shouldShowCustomerMarker(phase)) {
    coords.push({ latitude: snapshot.delivery.lat, longitude: snapshot.delivery.lng });
  }

  for (const sub of snapshot.subOrders) {
    if (shouldShowStoreMarker(sub, phase)) {
      coords.push({ latitude: sub.pickup.lat, longitude: sub.pickup.lng });
    }
    if (shouldShowRiderMarker(sub, phase) && sub.partner) {
      coords.push({ latitude: sub.partner.lat, longitude: sub.partner.lng });
    }
  }

  return coords;
}
