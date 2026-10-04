export type TrackingStageKey =
  | 'placed'
  | 'preparing'
  | 'ready'
  | 'partner_assigned'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered';

export type TrackingStep = {
  key: TrackingStageKey;
  label: string;
  done: boolean;
  active: boolean;
};

export type TrackingPartner = {
  displayName: string;
  lat: number;
  lng: number;
  lastUpdatedAt: string | null;
};

export type TrackingSubOrder = {
  id: string;
  storeName: string;
  status: string;
  statusLabel: string;
  pickup: { lat: number; lng: number; addressLine: string };
  partner?: TrackingPartner;
  assignmentStatus?: string;
};

export type OrderTrackingSnapshot = {
  orderId: string;
  orderNumber: string;
  parentStatus: string;
  isTerminal: boolean;
  etaMinutes: number | null;
  delivery: { addressLine: string; lat: number; lng: number };
  stages: { current: TrackingStageKey; steps: TrackingStep[] };
  subOrders: TrackingSubOrder[];
};
