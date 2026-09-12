import { UserType } from '@/types/auth';
import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { mockUser } from '../mock/data';
import { USE_MOCK } from '@/constants/api';

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (phone.startsWith('+')) return `+${digits}`;
  return `+91${digits}`;
}

export type AuthResult = {
  token: string;
  refreshToken: string;
  user: { id: string; name?: string; phone?: string; email?: string; role: string };
  isNewUser?: boolean;
};

export const authService = {
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) {
      await simulateDelay();
      if (phone.length < 10) return { success: false, message: 'Invalid phone number' };
      return { success: true, message: 'OTP sent successfully' };
    }
    const normalized = toE164(phone);
    await apiRequest('/auth/otp/send', {
      method: 'POST',
      skipAuth: true,
      body: { phone: normalized, userType: UserType.CUSTOMER },
    });
    return { success: true, message: 'OTP sent successfully' };
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthResult> {
    if (USE_MOCK) {
      await simulateDelay(500, 1200);
      if (otp !== '000000') throw new Error('Invalid OTP');
      return {
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh',
        user: { id: mockUser.id, name: mockUser.name, phone, role: 'CUSTOMER' },
      };
    }
    const normalized = toE164(phone);
    const res = await apiRequest<{
      token: string;
      refreshToken: string;
      user: { id: string; name?: string; email?: string; role: string };
      isNewUser?: boolean;
    }>('/auth/otp/verify', {
      method: 'POST',
      skipAuth: true,
      body: { phone: normalized, otp, userType: UserType.CUSTOMER },
    });
    return {
      token: res.token,
      refreshToken: res.refreshToken,
      user: { ...res.user, phone: normalized },
      isNewUser: res.isNewUser,
    };
  },
};
