import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { stores } from '../mock/data';
import { Store } from '@/types/store';
import { USE_MOCK } from '@/constants/api';
import { mapBackendStore } from './mappers';

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

  async getNearby(_lat?: number, _lng?: number): Promise<Store[]> {
    return this.getAll();
  },
};
