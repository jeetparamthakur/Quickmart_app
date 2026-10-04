import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HomeMode = 'groceries' | 'food';

type HomeModeState = {
  mode: HomeMode;
  setMode: (mode: HomeMode) => void;
};

export const useHomeModeStore = create<HomeModeState>()(
  persist(
    (set) => ({
      mode: 'groceries',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'quickmart-home-mode',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
