import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { mockUser } from '../mock/data';
import { USE_MOCK } from '@/constants/api';

export type CustomerProfile = {
  fullName?: string;
  phone?: string;
  email?: string;
};

export const customerService = {
  async getProfile(): Promise<CustomerProfile> {
    if (USE_MOCK) {
      await simulateDelay();
      return { fullName: mockUser.name, phone: mockUser.phone };
    }
    const res = await apiRequest<{ user: CustomerProfile }>('/auth/me');
    return res.user;
  },

  async updateProfile(fullName: string): Promise<{ fullName: string }> {
    if (USE_MOCK) {
      await simulateDelay();
      return { fullName: fullName.trim() };
    }
    return apiRequest<{ fullName: string }>('/customer/profile', {
      method: 'PATCH',
      body: { fullName: fullName.trim() },
    });
  },
};
