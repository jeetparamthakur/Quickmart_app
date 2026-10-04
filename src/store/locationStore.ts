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
  removeAddress: (id: string) => void;
  updateAddress: (id: string, patch: Partial<Address>) => void;
  setDefaultAddress: (id: string) => void;
  setHydrated: () => void;
  hasLocation: () => boolean;
};

function syncSelected(
  selected: Address | null,
  saved: Address[],
  preferredId?: string,
): Address | null {
  if (preferredId) {
    const match = saved.find((a) => a.id === preferredId);
    if (match) return match;
  }
  if (selected) {
    const match = saved.find((a) => a.id === selected.id);
    if (match) return match;
  }
  return saved.find((a) => a.isDefault) ?? saved[0] ?? null;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      selectedAddress: null,
      savedAddresses: defaultAddresses,
      isHydrated: false,
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      addAddress: (address) =>
        set((state) => {
          const savedAddresses = state.savedAddresses.some((a) => a.id === address.id)
            ? state.savedAddresses.map((a) => (a.id === address.id ? address : a))
            : [...state.savedAddresses, address];
          const withDefault = address.isDefault
            ? savedAddresses.map((a) => ({ ...a, isDefault: a.id === address.id }))
            : savedAddresses;
          return {
            savedAddresses: withDefault,
            selectedAddress: address,
          };
        }),
      setSavedAddresses: (addrs) =>
        set((state) => ({
          savedAddresses: addrs,
          selectedAddress: syncSelected(state.selectedAddress, addrs),
        })),
      removeAddress: (id) =>
        set((state) => {
          const savedAddresses = state.savedAddresses.filter((a) => a.id !== id);
          const selectedAddress =
            state.selectedAddress?.id === id
              ? syncSelected(null, savedAddresses)
              : syncSelected(state.selectedAddress, savedAddresses);
          return { savedAddresses, selectedAddress };
        }),
      updateAddress: (id, patch) =>
        set((state) => {
          const savedAddresses = state.savedAddresses.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          );
          const selectedAddress =
            state.selectedAddress?.id === id
              ? { ...state.selectedAddress, ...patch }
              : syncSelected(state.selectedAddress, savedAddresses);
          return { savedAddresses, selectedAddress };
        }),
      setDefaultAddress: (id) =>
        set((state) => {
          const savedAddresses = state.savedAddresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }));
          const selectedAddress = syncSelected(state.selectedAddress, savedAddresses, id);
          return { savedAddresses, selectedAddress };
        }),
      setHydrated: () => set({ isHydrated: true }),
      hasLocation: () => get().selectedAddress !== null,
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
