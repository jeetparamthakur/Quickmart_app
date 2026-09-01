import { simulateDelay } from './utils';
import { addresses } from '../mock/data';
import { Address } from '@/types/location';

export const locationService = {
  async getSavedAddresses(): Promise<Address[]> {
    await simulateDelay();
    return addresses;
  },

  async searchAddresses(query: string): Promise<Address[]> {
    await simulateDelay(200, 500);
    const q = query.toLowerCase();
    return addresses.filter(
      (a) =>
        a.line1.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.label.toLowerCase().includes(q)
    );
  },

  async reverseGeocode(_lat: number, _lng: number): Promise<Address> {
    await simulateDelay();
    return {
      id: 'detected-' + Date.now(),
      label: 'Current Location',
      line1: 'Detected Location, Green Park',
      city: 'New Delhi',
      pincode: '110016',
      latitude: _lat,
      longitude: _lng,
    };
  },
};
