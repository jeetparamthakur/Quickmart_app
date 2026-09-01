import { simulateDelay } from './utils';
import { mockUser } from '../mock/data';

export type AuthResult = {
  token: string;
  user: typeof mockUser;
};

export const authService = {
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    await simulateDelay();
    if (phone.length < 10) {
      return { success: false, message: 'Invalid phone number' };
    }
    return { success: true, message: 'OTP sent successfully' };
  },

  async verifyOtp(_phone: string, otp: string): Promise<AuthResult> {
    await simulateDelay(500, 1200);
    if (otp.length !== 6) {
      throw new Error('Invalid OTP');
    }
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: { ...mockUser, phone: _phone.startsWith('+') ? _phone : '+91 ' + _phone },
    };
  },
};
