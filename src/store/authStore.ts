import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStoredTokens, clearStoredTokens } from '@/services/api/client';

type User = { id: string; name?: string; phone?: string; email?: string; role?: string };
const TOKEN_KEY = 'auth-token';

export type LoginOptions = {
  requiresNameSetup?: boolean;
};

type AuthState = {
  token: string | null;
  user: User | null;
  phone: string;
  isAuthenticated: boolean;
  requiresNameSetup: boolean;
  isHydrated: boolean;
  setPhone: (phone: string) => void;
  updateUser: (patch: Partial<User>) => void;
  login: (token: string, user: User, refreshToken?: string, options?: LoginOptions) => Promise<void>;
  clearRequiresNameSetup: () => void;
  logout: () => Promise<void>;
  setHydrated: () => void;
  restoreToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      phone: '',
      isAuthenticated: false,
      requiresNameSetup: false,
      isHydrated: false,
      setPhone: (phone) => set({ phone }),
      updateUser: (patch) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...patch } : s.user,
        })),
      login: async (token, user, refreshToken, options) => {
        await setStoredTokens(token, refreshToken);
        set({
          token,
          user,
          isAuthenticated: true,
          requiresNameSetup: options?.requiresNameSetup ?? false,
        });
      },
      clearRequiresNameSetup: () => set({ requiresNameSetup: false }),
      logout: async () => {
        set({
          token: null,
          user: null,
          phone: '',
          isAuthenticated: false,
          requiresNameSetup: false,
        });
        await clearStoredTokens();
      },
      setHydrated: () => set({ isHydrated: true }),
      restoreToken: async () => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token && get().user) {
          set({ token, isAuthenticated: true });
          return;
        }
        if (get().isAuthenticated) {
          set({ token: null, user: null, isAuthenticated: false, requiresNameSetup: false });
          await clearStoredTokens();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => async (state) => {
        await state?.restoreToken();
        state?.setHydrated();
      },
      partialize: (state) => ({
        user: state.user,
        phone: state.phone,
        isAuthenticated: state.isAuthenticated,
        requiresNameSetup: state.requiresNameSetup,
      }),
    }
  )
);
