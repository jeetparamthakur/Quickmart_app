import { simulateDelay } from './utils';
import { Address } from '@/types/location';
import { photonSearchAddresses, reverseGeocode } from '@/services/geocoding';
import { addressResultToLine1, type AddressResult } from '@/utils/address';
import { addressService } from './address.service';
import { getStoredToken } from './client';
import { USE_MOCK } from '@/constants/api';
import { useLocationStore } from '@/store/locationStore';

function resultToAddress(result: AddressResult, label = 'Search'): Address {
  return {
    id: `search-${result.latitude}-${result.longitude}-${Date.now()}`,
    label,
    line1: addressResultToLine1(result),
    city: result.city,
    pincode: result.pincode,
    latitude: result.latitude,
    longitude: result.longitude,
    receiverName: '',
    receiverPhone: '',
  };
}

export const locationService = {
  async getSavedAddresses(): Promise<Address[]> {
    const local = useLocationStore.getState().savedAddresses;
    if (USE_MOCK) {
      await simulateDelay();
      return local.length ? local : await addressService.list();
    }
    const token = await getStoredToken();
    if (!token) {
      await simulateDelay(100, 200);
      return local;
    }
    return addressService.list();
  },

  async searchAddresses(query: string): Promise<Address[]> {
    const results = await photonSearchAddresses(query);
    return results.map((r) => resultToAddress(r));
  },

  async reverseGeocode(lat: number, lng: number): Promise<Address> {
    const result = await reverseGeocode(lat, lng);
    return resultToAddress(result, 'Current Location');
  },
};
