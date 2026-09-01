import { simulateDelay } from './utils';
import { stores } from '../mock/data';
import { Store } from '@/types/store';

export const storeService = {
  async getAll(): Promise<Store[]> {
    await simulateDelay();
    return [...stores].sort((a, b) => a.distanceKm - b.distanceKm);
  },

  async getById(id: string): Promise<Store | null> {
    await simulateDelay();
    return stores.find((s) => s.id === id) ?? null;
  },

  async getNearby(_lat?: number, _lng?: number): Promise<Store[]> {
    await simulateDelay();
    return [...stores].sort((a, b) => a.distanceKm - b.distanceKm);
  },
};
