import { apiRequest } from './client';
import { USE_MOCK } from '@/constants/api';
import type { OrderTrackingSnapshot, TrackingStageKey, TrackingStep } from '@/types/order-tracking';
import { ordersService } from './orders.service';
import { parentStatusLabel } from './orderMappers';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STAGE_ORDER: TrackingStageKey[] = [
  'placed',
  'preparing',
  'ready',
  'partner_assigned',
  'picked_up',
  'on_the_way',
  'delivered',
];

const SUB_TO_STAGE: Record<string, TrackingStageKey> = {
  PLACED: 'placed',
  ACCEPTED: 'preparing',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready',
  DELIVERY_ASSIGNED: 'partner_assigned',
  PICKED_UP: 'picked_up',
  OUT_FOR_DELIVERY: 'on_the_way',
  DELIVERED: 'delivered',
};

const STAGE_LABELS: Record<TrackingStageKey, string> = {
  placed: 'Order placed',
  preparing: 'Store preparing',
  ready: 'Ready for pickup',
  partner_assigned: 'Delivery partner assigned',
  picked_up: 'Picked up',
  on_the_way: 'On the way',
  delivered: 'Delivered',
};

function buildSteps(current: TrackingStageKey): TrackingStep[] {
  const idx = STAGE_ORDER.indexOf(current);
  return STAGE_ORDER.map((key, i) => ({
    key,
    label: STAGE_LABELS[key],
    done: i < idx || (key === 'delivered' && current === 'delivered'),
    active: i === idx,
  }));
}

function mapApiResponse(raw: Record<string, unknown>): OrderTrackingSnapshot {
  const stages = raw.stages as Record<string, unknown> | undefined;
  const steps = (stages?.steps as Record<string, unknown>[] | undefined) ?? [];
  return {
    orderId: String(raw.orderId ?? ''),
    orderNumber: String(raw.orderNumber ?? ''),
    parentStatus: String(raw.parentStatus ?? ''),
    isTerminal: Boolean(raw.isTerminal),
    etaMinutes: raw.etaMinutes != null ? Number(raw.etaMinutes) : null,
    delivery: {
      addressLine: String((raw.delivery as Record<string, unknown>)?.addressLine ?? ''),
      lat: Number((raw.delivery as Record<string, unknown>)?.lat ?? 0),
      lng: Number((raw.delivery as Record<string, unknown>)?.lng ?? 0),
    },
    stages: {
      current: (stages?.current as TrackingStageKey) ?? 'placed',
      steps: steps.map((s) => ({
        key: s.key as TrackingStageKey,
        label: String(s.label ?? s.key),
        done: Boolean(s.done),
        active: Boolean(s.active),
      })),
    },
    subOrders: ((raw.subOrders as Record<string, unknown>[]) ?? []).map((so) => ({
      id: String(so.id ?? ''),
      storeName: String(so.storeName ?? ''),
      status: String(so.status ?? ''),
      statusLabel: String(so.statusLabel ?? ''),
      pickup: {
        lat: Number((so.pickup as Record<string, unknown>)?.lat ?? 0),
        lng: Number((so.pickup as Record<string, unknown>)?.lng ?? 0),
        addressLine: String((so.pickup as Record<string, unknown>)?.addressLine ?? ''),
      },
      partner: so.partner
        ? {
            displayName: String((so.partner as Record<string, unknown>).displayName ?? ''),
            lat: Number((so.partner as Record<string, unknown>).lat ?? 0),
            lng: Number((so.partner as Record<string, unknown>).lng ?? 0),
            lastUpdatedAt: ((so.partner as Record<string, unknown>).lastUpdatedAt as string | null) ?? null,
          }
        : undefined,
      assignmentStatus: so.assignmentStatus ? String(so.assignmentStatus) : undefined,
    })),
  };
}

async function fallbackFromOrderDetail(orderId: string): Promise<OrderTrackingSnapshot | null> {
  const detail = await ordersService.getById(orderId);
  if (!detail) return null;

  let primary: TrackingStageKey = 'placed';
  let minIdx = STAGE_ORDER.length - 1;
  for (const sub of detail.subOrders) {
    const key = SUB_TO_STAGE[sub.status.toUpperCase()] ?? 'placed';
    const idx = STAGE_ORDER.indexOf(key);
    if (idx < minIdx) {
      minIdx = idx;
      primary = key;
    }
  }
  if (detail.status === 'delivered' || detail.status === 'cancelled') {
    primary = 'delivered';
  }

  const isTerminal = detail.status === 'delivered' || detail.status === 'cancelled';

  return {
    orderId: detail.id,
    orderNumber: detail.orderNumber,
    parentStatus: detail.status,
    isTerminal,
    etaMinutes: 25,
    delivery: { addressLine: 'Delivery address', lat: 28.6139, lng: 77.209 },
    stages: { current: primary, steps: buildSteps(primary) },
    subOrders: detail.subOrders.map((sub) => ({
      id: sub.id,
      storeName: sub.storeName ?? 'Store',
      status: sub.status,
      statusLabel: sub.statusLabel,
      pickup: { lat: 28.614, lng: 77.21, addressLine: sub.storeName ?? 'Store' },
    })),
  };
}

export const orderTrackingService = {
  async getTracking(orderId: string): Promise<OrderTrackingSnapshot | null> {
    if (!orderId) return null;

    if (USE_MOCK || !UUID_RE.test(orderId)) {
      return fallbackFromOrderDetail(orderId);
    }

    try {
      const raw = await apiRequest<Record<string, unknown>>(`/customer/orders/${orderId}/tracking`);
      return mapApiResponse(raw);
    } catch {
      return fallbackFromOrderDetail(orderId);
    }
  },

  headlineFor(snapshot: OrderTrackingSnapshot): string {
    const active = snapshot.stages.steps.find((s) => s.active);
    if (active) return active.label;
    if (snapshot.isTerminal) return parentStatusLabel(snapshot.parentStatus);
    return snapshot.stages.steps[0]?.label ?? 'Tracking order';
  },
};
