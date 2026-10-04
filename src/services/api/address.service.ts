import { apiRequest, getStoredToken } from './client';
import { USE_MOCK } from '@/constants/api';
import { simulateDelay } from './utils';
import { addresses as mockAddresses } from '../mock/data';
import { Address, normalizePhoneDigits } from '@/types/location';

export type ApiCustomerAddress = {
  id: string;
  label: string;
  fullAddress: string;
  addressLine?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  pincode?: string | null;
  receiverName?: string | null;
  receiverPhone?: string | null;
  lat?: string | null;
  lng?: string | null;
  isDefault?: boolean;
};

export type AddressCreatePayload = Omit<Address, 'id'> & { isDefault?: boolean };

function parseCoord(value: string | null | undefined, fallback = 0): number {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mapApiToAddress(row: ApiCustomerAddress): Address {
  const line1 = row.addressLine?.trim() || row.fullAddress.split('—').pop()?.trim() || row.fullAddress;
  return {
    id: row.id,
    label: row.label,
    line1,
    line2: row.addressLine2?.trim() || undefined,
    city: row.city?.trim() || '',
    pincode: row.pincode?.trim() || '',
    latitude: parseCoord(row.lat, 28.6139),
    longitude: parseCoord(row.lng, 77.209),
    isDefault: row.isDefault ?? false,
    receiverName: row.receiverName?.trim() || '',
    receiverPhone: normalizePhoneDigits(row.receiverPhone ?? ''),
  };
}

export function mapAddressToDto(address: AddressCreatePayload) {
  return {
    label: address.label,
    addressLine: address.line1,
    addressLine2: address.line2,
    city: address.city,
    pincode: address.pincode,
    receiverName: address.receiverName.trim(),
    receiverPhone: normalizePhoneDigits(address.receiverPhone),
    lat: String(address.latitude),
    lng: String(address.longitude),
    isDefault: address.isDefault ?? false,
  };
}

async function canUseApi(): Promise<boolean> {
  if (USE_MOCK) return false;
  const token = await getStoredToken();
  return Boolean(token);
}

function unwrapList(raw: unknown): ApiCustomerAddress[] {
  if (Array.isArray(raw)) return raw as ApiCustomerAddress[];
  const data = (raw as { data?: ApiCustomerAddress[] })?.data;
  return Array.isArray(data) ? data : [];
}

function unwrapOne(raw: unknown): ApiCustomerAddress {
  if (raw && typeof raw === 'object' && 'id' in raw) return raw as ApiCustomerAddress;
  const data = (raw as { data?: ApiCustomerAddress })?.data;
  if (data && typeof data === 'object') return data;
  throw new Error('Invalid address response');
}

export const addressService = {
  async list(): Promise<Address[]> {
    if (!(await canUseApi())) {
      await simulateDelay(200, 400);
      return mockAddresses;
    }
    const raw = await apiRequest<unknown>('/customer/addresses');
    return unwrapList(raw).map(mapApiToAddress);
  },

  async create(payload: AddressCreatePayload): Promise<Address> {
    if (!(await canUseApi())) {
      await simulateDelay(300, 600);
      const local: Address = {
        ...payload,
        id: 'addr-' + Date.now(),
        receiverPhone: normalizePhoneDigits(payload.receiverPhone),
      };
      return local;
    }
    const raw = await apiRequest<unknown>('/customer/addresses', {
      method: 'POST',
      body: mapAddressToDto(payload),
    });
    return mapApiToAddress(unwrapOne(raw));
  },

  async update(id: string, payload: Partial<AddressCreatePayload>): Promise<Address> {
    if (!(await canUseApi())) {
      await simulateDelay(300, 600);
      return {
        id,
        label: payload.label ?? 'Home',
        line1: payload.line1 ?? '',
        line2: payload.line2,
        city: payload.city ?? '',
        pincode: payload.pincode ?? '',
        latitude: payload.latitude ?? 0,
        longitude: payload.longitude ?? 0,
        isDefault: payload.isDefault,
        receiverName: payload.receiverName ?? '',
        receiverPhone: normalizePhoneDigits(payload.receiverPhone ?? ''),
      };
    }
    const body: Record<string, unknown> = {};
    if (payload.label !== undefined) body.label = payload.label;
    if (payload.line1 !== undefined) body.addressLine = payload.line1;
    if (payload.line2 !== undefined) body.addressLine2 = payload.line2;
    if (payload.city !== undefined) body.city = payload.city;
    if (payload.pincode !== undefined) body.pincode = payload.pincode;
    if (payload.receiverName !== undefined) body.receiverName = payload.receiverName;
    if (payload.receiverPhone !== undefined) {
      body.receiverPhone = normalizePhoneDigits(payload.receiverPhone);
    }
    if (payload.latitude !== undefined) body.lat = String(payload.latitude);
    if (payload.longitude !== undefined) body.lng = String(payload.longitude);
    if (payload.isDefault !== undefined) body.isDefault = payload.isDefault;

    const raw = await apiRequest<unknown>(`/customer/addresses/${id}`, {
      method: 'PATCH',
      body,
    });
    return mapApiToAddress(unwrapOne(raw));
  },

  async remove(id: string): Promise<void> {
    if (!(await canUseApi())) {
      await simulateDelay(200, 400);
      return;
    }
    await apiRequest(`/customer/addresses/${id}`, { method: 'DELETE' });
  },
};
