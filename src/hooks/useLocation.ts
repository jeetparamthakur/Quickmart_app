import { useLocationStore } from '@/store/locationStore';

export function useLocation() {
  const selectedAddress = useLocationStore((s) => s.selectedAddress);
  const savedAddresses = useLocationStore((s) => s.savedAddresses);
  const setSelectedAddress = useLocationStore((s) => s.setSelectedAddress);
  const addAddress = useLocationStore((s) => s.addAddress);
  const hasLocation = useLocationStore((s) => s.hasLocation);

  return {
    selectedAddress,
    savedAddresses,
    setSelectedAddress,
    addAddress,
    hasLocation: hasLocation(),
    displayLocation: selectedAddress
      ? `${selectedAddress.label} · ${selectedAddress.line1}`
      : 'Select location',
  };
}
