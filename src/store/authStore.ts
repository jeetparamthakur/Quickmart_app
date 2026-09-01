import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUser } from '@/services/mock/data';

type User = typeof mockUser;
const TOKEN_KEY = 'auth-token';

type AuthState = {
  token: string | null;
  user: User | null;
  phone: string;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setPhone: (phone: string) => void;
  login: (token: string, user: User) => Promise<void>;
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
      isHydrated: false,
      setPhone: (phone) => set({ phone }),
      login: async (token, user) => {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        set({ token, user, isAuthenticated: true });
      },
      logout: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        set({ token: null, user: null, phone: '', isAuthenticated: false });
      },
      setHydrated: () => set({ isHydrated: true }),
      restoreToken: async () => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token && get().user) {
          set({ token, isAuthenticated: true });
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
      }),
    }
  )
);
