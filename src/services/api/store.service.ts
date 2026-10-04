import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { stores } from '../mock/data';
import { Store, PartnerType } from '@/types/store';
import { USE_MOCK } from '@/constants/api';
import { mapBackendNearbyStore, mapBackendStore } from './mappers';
import { DEFAULT_CUSTOMER_RADIUS_KM, haversineKm } from '@/utils/geo';

export type NearbyStoreOptions = {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  partnerType?: PartnerType;
};

function withMockDistances(
  list: Store[],
  lat?: number,
  lng?: number,
  radiusKm = DEFAULT_CUSTOMER_RADIUS_KM,
  partnerType?: PartnerType,
): Store[] {
  const hasCoords = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  return list
    .map((store) => {
      const distanceKm = hasCoords
        ? haversineKm(lat!, lng!, store.latitude, store.longitude)
        : store.distanceKm;
      return { ...store, distanceKm: Math.round(distanceKm * 100) / 100 };
    })
    .filter((store) => {
      if (partnerType && (store.partnerType ?? 'STORE') !== partnerType) return false;
      if (hasCoords && store.distanceKm > radiusKm) return false;
      const serviceRadius = store.serviceRadiusKm ?? DEFAULT_CUSTOMER_RADIUS_KM;
      if (hasCoords && serviceRadius > 0 && store.distanceKm > serviceRadius) return false;
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export const storeService = {
  async getAll(): Promise<Store[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return [...stores].sort((a, b) => a.distanceKm - b.distanceKm);
    }
    const data = await apiRequest<Record<string, unknown>[]>('/stores');
    return data.map(mapBackendStore);
  },

  async getById(id: string): Promise<Store | null> {
    if (USE_MOCK) {
      await simulateDelay();
      return stores.find((s) => s.id === id) ?? null;
    }
    const all = await this.getAll();
    return all.find((s) => s.id === id) ?? null;
  },

  async getNearby(options: NearbyStoreOptions = {}): Promise<Store[]> {
    const { lat, lng, radiusKm = DEFAULT_CUSTOMER_RADIUS_KM, partnerType } = options;

    if (USE_MOCK) {
      await simulateDelay();
      return withMockDistances(stores, lat, lng, radiusKm, partnerType);
    }

    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      const all = await this.getAll();
      return partnerType ? all.filter((s) => (s.partnerType ?? 'STORE') === partnerType) : all;
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radiusKm: String(radiusKm),
    });
    if (partnerType) params.set('partnerType', partnerType);

    const data = await apiRequest<Record<string, unknown>[]>(`/stores/nearby?${params}`);
    return data.map(mapBackendNearbyStore);
  },
};
