import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '@/types/location';
import { addresses as defaultAddresses } from '@/services/mock/data';

type LocationState = {
  selectedAddress: Address | null;
  savedAddresses: Address[];
  isHydrated: boolean;
  setSelectedAddress: (address: Address) => void;
  addAddress: (address: Address) => void;
  setSavedAddresses: (addresses: Address[]) => void;
  setHydrated: () => void;
  hasLocation: () => boolean;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      selectedAddress: null,
      savedAddresses: defaultAddresses,
      isHydrated: false,
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      addAddress: (address) =>
        set((state) => ({
          savedAddresses: [...state.savedAddresses, address],
          selectedAddress: address,
        })),
      setSavedAddresses: (addrs) => set({ savedAddresses: addrs }),
      setHydrated: () => set({ isHydrated: true }),
      hasLocation: () => get().selectedAddress !== null,
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
